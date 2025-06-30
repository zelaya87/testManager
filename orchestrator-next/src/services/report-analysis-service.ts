import { prisma } from "@/lib/prisma";

export interface CreateAnalysisData {
  projectId: string;
  executionId?: string;
  summary: string;
  insights: string[];
  recommendations: string[];
  riskAreas: string[];
  performanceMetrics: {
    [key: string]: any;
  };
  aiModel?: string;
}

export const reportAnalysisService = {
  async createAnalysis(data: CreateAnalysisData) {
    return prisma.testAnalysis.create({
      data: {
        ...data,
        createdAt: new Date(),
      },
    });
  },

  async getProjectAnalytics(projectId: string) {
    const [history, analysis] = await Promise.all([
      prisma.testHistory.findMany({
        where: { projectId },
        orderBy: { startTime: "desc" },
        take: 50,
      }),
      prisma.testAnalysis.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          project: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    const successTests = history.filter((test) => test.success);
    const successRate =
      history.length > 0 ? successTests.length / history.length : 0;
    const totalDuration = history.reduce(
      (sum, test) => sum + (test.duration || 0),
      0
    );
    const averageDuration =
      history.length > 0 ? totalDuration / history.length : 0;

    return {
      summary: {
        successRate,
        averageDuration,
        totalTests: history.length,
      },
      executionHistory: history.map((test) => ({
        startTime: test.startTime,
        success: test.success || false,
      })),
      recentAnalysis: analysis,
    };
  },

  async getTeamAnalytics(teamId: string) {
    const projects = await prisma.testProject.findMany({
      where: { teamId },
      select: { id: true },
    });

    const projectIds = projects.map((p) => p.id);

    const [history, analysis] = await Promise.all([
      prisma.testHistory.findMany({
        where: {
          projectId: {
            in: projectIds,
          },
        },
        orderBy: { startTime: "desc" },
        take: 100,
      }),
      prisma.testAnalysis.findMany({
        where: {
          projectId: {
            in: projectIds,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          project: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    const successTests = history.filter((test) => test.success);
    const successRate =
      history.length > 0 ? successTests.length / history.length : 0;
    const totalDuration = history.reduce(
      (sum, test) => sum + (test.duration || 0),
      0
    );
    const averageDuration =
      history.length > 0 ? totalDuration / history.length : 0;

    return {
      summary: {
        successRate,
        averageDuration,
        totalTests: history.length,
      },
      executionHistory: history.map((test) => ({
        startTime: test.startTime,
        success: test.success || false,
      })),
      recentAnalysis: analysis,
    };
  },

  async getAnalysisByExecution(executionId: string) {
    return prisma.testAnalysis.findFirst({
      where: { executionId },
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
    });
  },

  async getProjectAnalyses(projectId: string) {
    return prisma.testAnalysis.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
    });
  },
};
