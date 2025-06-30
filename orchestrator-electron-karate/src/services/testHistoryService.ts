import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface TestExecutionData {
  userId: string;
  testName: string;
  category: string;
  status: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  success?: boolean;
  errorLog?: string;
  reportPath?: string;
}

export const testHistoryService = {
  async createTestExecution(data: TestExecutionData) {
    return prisma.testHistory.create({
      data,
    });
  },

  async updateTestExecution(id: string, data: Partial<TestExecutionData>) {
    return prisma.testHistory.update({
      where: { id },
      data,
    });
  },

  async getTestHistory(userId: string) {
    return prisma.testHistory.findMany({
      where: { userId },
      orderBy: { startTime: "desc" },
    });
  },

  async getTestHistoryByCategory(userId: string, category: string) {
    return prisma.testHistory.findMany({
      where: {
        userId,
        category,
      },
      orderBy: { startTime: "desc" },
    });
  },

  async getTestHistoryByName(userId: string, testName: string) {
    return prisma.testHistory.findMany({
      where: {
        userId,
        testName,
      },
      orderBy: { startTime: "desc" },
    });
  },

  async deleteTestHistory(id: string) {
    return prisma.testHistory.delete({
      where: { id },
    });
  },
};
