import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import { sendEmail } from "./emailService"; // Você precisará implementar este serviço

const prisma = new PrismaClient();

interface CreateTeamData {
  name: string;
  description?: string;
  createdBy: string; // userId
}

interface TeamInviteData {
  email: string;
  role: "ADMIN" | "MEMBER" | "VIEWER";
  teamId: string;
  invitedBy: string; // userId
}

export const teamService = {
  async createTeam(data: CreateTeamData) {
    const team = await prisma.team.create({
      data: {
        name: data.name,
        description: data.description,
        members: {
          create: {
            userId: data.createdBy,
            role: "ADMIN",
          },
        },
        settings: {
          create: {
            notificationsEnabled: true,
            autoAnalyzeReports: true,
            defaultEnvironment: "DEV",
          },
        },
      },
      include: {
        members: true,
        settings: true,
      },
    });

    return team;
  },

  async inviteMember(data: TeamInviteData) {
    // Verificar se o usuário já é membro
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId: data.teamId,
        user: {
          email: data.email,
        },
      },
    });

    if (existingMember) {
      throw new Error("User is already a member of this team");
    }

    // Criar convite
    const token = randomBytes(32).toString("hex");
    const invite = await prisma.teamInvite.create({
      data: {
        teamId: data.teamId,
        email: data.email,
        role: data.role,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      },
      include: {
        team: true,
      },
    });

    // Enviar email de convite
    await sendEmail({
      to: data.email,
      subject: `Convite para juntar-se à equipe ${invite.team.name}`,
      template: "team-invite",
      data: {
        teamName: invite.team.name,
        inviteUrl: `${process.env.APP_URL}/invite/accept/${token}`,
      },
    });

    return invite;
  },

  async acceptInvite(token: string, userId: string) {
    const invite = await prisma.teamInvite.findUnique({
      where: { token },
    });

    if (!invite) {
      throw new Error("Invalid invite token");
    }

    if (invite.expiresAt < new Date()) {
      throw new Error("Invite has expired");
    }

    // Criar membro da equipe
    const member = await prisma.teamMember.create({
      data: {
        teamId: invite.teamId,
        userId,
        role: invite.role,
      },
    });

    // Deletar convite
    await prisma.teamInvite.delete({
      where: { id: invite.id },
    });

    return member;
  },

  async updateMemberRole(teamId: string, userId: string, newRole: string) {
    return prisma.teamMember.update({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
      data: { role: newRole },
    });
  },

  async removeMember(teamId: string, userId: string) {
    return prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });
  },

  async getTeamMembers(teamId: string) {
    return prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  },

  async updateTeamSettings(teamId: string, settings: any) {
    return prisma.teamSettings.update({
      where: { teamId },
      data: settings,
    });
  },

  async getTeamProjects(teamId: string) {
    return prisma.testProject.findMany({
      where: { teamId },
      include: {
        features: true,
        history: {
          orderBy: { startTime: "desc" },
          take: 1,
        },
      },
    });
  },

  async getTeamAnalytics(teamId: string) {
    const projects = await this.getTeamProjects(teamId);
    const projectIds = projects.map((p) => p.id);

    const [history, analysis] = await Promise.all([
      prisma.testHistory.findMany({
        where: { projectId: { in: projectIds } },
        orderBy: { startTime: "desc" },
        take: 100,
      }),
      prisma.testAnalysis.findMany({
        where: { projectId: { in: projectIds } },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    return {
      executionHistory: history,
      recentAnalysis: analysis,
      summary: {
        totalProjects: projects.length,
        totalTests: history.length,
        successRate: history.filter((h) => h.success).length / history.length,
        averageDuration:
          history.reduce((acc, h) => acc + (h.duration || 0), 0) /
          history.length,
      },
    };
  },
};
