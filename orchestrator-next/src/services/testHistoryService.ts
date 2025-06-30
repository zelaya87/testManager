import { prisma } from "@/lib/prisma";

interface TestExecutionData {
  userId: string;
  projectId: string;
  testName: string;
  category: string;
  status: string;
  startTime: Date;
  endTime?: Date;
  success?: boolean;
  errorLog?: string;
  reportPath?: string;
  duration?: number;
}

class TestHistoryService {
  private static instance: TestHistoryService;

  private constructor() {}

  public static getInstance(): TestHistoryService {
    if (!TestHistoryService.instance) {
      TestHistoryService.instance = new TestHistoryService();
    }
    return TestHistoryService.instance;
  }

  async createTestExecution(data: TestExecutionData) {
    return await prisma.testExecution.create({
      data,
    });
  }

  async updateTestExecution(
    id: string,
    data: Partial<Omit<TestExecutionData, "userId" | "projectId" | "testName">>
  ) {
    return await prisma.testExecution.update({
      where: { id },
      data,
    });
  }

  async getTestExecutions(userId: string) {
    return await prisma.testExecution.findMany({
      where: { userId },
      orderBy: { startTime: "desc" },
    });
  }

  async getTestExecutionsByProject(userId: string, projectId: string) {
    return await prisma.testExecution.findMany({
      where: { userId, projectId },
      orderBy: { startTime: "desc" },
    });
  }
}

export const testHistoryService = TestHistoryService.getInstance();
