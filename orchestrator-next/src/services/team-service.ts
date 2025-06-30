import { prisma } from "@/lib/prisma";

export interface CreateTeamData {
  name: string;
  description?: string;
  createdBy: string;
}

export interface UpdateTeamData {
  name?: string;
  description?: string;
}

export interface TeamInviteData {
  teamId: string;
  email: string;
  role: string;
  token: string;
  expiresAt: Date;
}

export interface TeamMemberData {
  teamId: string;
  userId: string;
  role: string;
  settings?: {
    [key: string]: any;
  };
}

export interface TeamSettingsData {
  notificationsEnabled?: boolean;
  autoAnalyzeReports?: boolean;
  defaultEnvironment?: string;
  customSettings?: {
    [key: string]: any;
  };
}

export const teamService = {
  async createTeam(data: CreateTeamData) {
    return prisma.team.create({
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
  },

  async updateTeam(id: string, data: UpdateTeamData) {
    return prisma.team.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  },

  async deleteTeam(id: string) {
    return prisma.team.delete({
      where: { id },
    });
  },

  async getTeam(id: string) {
    return prisma.team.findUnique({
      where: { id },
      include: {
        members: {
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
        },
        projects: {
          where: {
            isActive: true,
          },
          include: {
            features: true,
            history: {
              orderBy: {
                startTime: "desc",
              },
              take: 1,
            },
          },
        },
        settings: true,
      },
    });
  },

  async getUserTeams(userId: string) {
    return prisma.team.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
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
        },
        projects: {
          where: {
            isActive: true,
          },
          include: {
            features: true,
            history: {
              orderBy: {
                startTime: "desc",
              },
              take: 1,
            },
          },
        },
        settings: true,
      },
    });
  },

  async createTeamInvite(data: TeamInviteData) {
    return prisma.teamInvite.create({
      data,
    });
  },

  async getTeamInvite(token: string) {
    return prisma.teamInvite.findUnique({
      where: { token },
      include: {
        team: true,
      },
    });
  },

  async deleteTeamInvite(token: string) {
    return prisma.teamInvite.delete({
      where: { token },
    });
  },

  async addTeamMember(data: TeamMemberData) {
    return prisma.teamMember.create({
      data,
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

  async updateTeamMember(
    teamId: string,
    userId: string,
    data: Partial<TeamMemberData>
  ) {
    return prisma.teamMember.update({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
      data,
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

  async removeTeamMember(teamId: string, userId: string) {
    return prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });
  },

  async updateTeamSettings(teamId: string, data: TeamSettingsData) {
    return prisma.teamSettings.update({
      where: { teamId },
      data,
    });
  },

  async getTeamSettings(teamId: string) {
    return prisma.teamSettings.findUnique({
      where: { teamId },
    });
  },
};
