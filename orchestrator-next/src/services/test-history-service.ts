import { prisma } from "@/lib/prisma";

export interface TestExecutionData {
  userId: string;
  testName: string;
  category: string;
  status: string;
  type: string;
  environment: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  success?: boolean;
  errorLog?: string;
  reportPath?: string;
  metrics?: {
    [key: string]: any;
  };
  projectId?: string;
}

export interface UpdateTestExecutionData {
  status?: string;
  endTime?: Date;
  duration?: number;
  success?: boolean;
  errorLog?: string;
  reportPath?: string;
  metrics?: {
    [key: string]: any;
  };
}

export const testHistoryService = {
  async createTestExecution(data: TestExecutionData) {
    return prisma.testHistory.create({
      data,
    });
  },

  async updateTestExecution(id: string, data: UpdateTestExecutionData) {
    return prisma.testHistory.update({
      where: { id },
      data,
    });
  },

  async getTestHistory(userId: string, projectId?: string) {
    return prisma.testHistory.findMany({
      where: {
        userId,
        ...(projectId && { projectId }),
      },
      orderBy: {
        startTime: "desc",
      },
      take: 100,
    });
  },

  async getTestExecutionsByProject(projectId: string) {
    return prisma.testHistory.findMany({
      where: {
        projectId,
      },
      orderBy: {
        startTime: "desc",
      },
      include: {
        analysis: true,
      },
    });
  },

  async getTestExecutionsByCategory(category: string, projectId?: string) {
    return prisma.testHistory.findMany({
      where: {
        category,
        ...(projectId && { projectId }),
      },
      orderBy: {
        startTime: "desc",
      },
    });
  },

  async getTestExecutionsByType(type: string, projectId?: string) {
    return prisma.testHistory.findMany({
      where: {
        type,
        ...(projectId && { projectId }),
      },
      orderBy: {
        startTime: "desc",
      },
    });
  },

  async getTestExecutionsByEnvironment(
    environment: string,
    projectId?: string
  ) {
    return prisma.testHistory.findMany({
      where: {
        environment,
        ...(projectId && { projectId }),
      },
      orderBy: {
        startTime: "desc",
      },
    });
  },

  async getTestExecution(id: string) {
    return prisma.testHistory.findUnique({
      where: { id },
      include: {
        analysis: true,
      },
    });
  },

  async deleteTestExecution(id: string) {
    return prisma.testHistory.delete({
      where: { id },
    });
  },

  async getTestExecutionStats(projectId?: string) {
    const history = await prisma.testHistory.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: {
        startTime: "desc",
      },
      take: 100,
    });

    const totalTests = history.length;
    const successfulTests = history.filter((test) => test.success).length;
    const failedTests = totalTests - successfulTests;
    const totalDuration = history.reduce(
      (sum, test) => sum + (test.duration || 0),
      0
    );
    const averageDuration = totalTests > 0 ? totalDuration / totalTests : 0;

    return {
      totalTests,
      successfulTests,
      failedTests,
      successRate: totalTests > 0 ? successfulTests / totalTests : 0,
      averageDuration,
      totalDuration,
    };
  },
};
