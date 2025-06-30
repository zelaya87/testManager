import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface CreateProjectData {
  userId: string;
  name: string;
  path: string;
  description?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  isActive?: boolean;
  lastRun?: Date;
}

export interface CreateFeatureData {
  projectId: string;
  name: string;
  path: string;
  category: string;
  dataFiles?: string[];
  description?: string;
  tags?: string[];
}

export const projectService = {
  async createProject(data: CreateProjectData) {
    return prisma.testProject.create({
      data: {
        ...data,
        features: {
          create: [], // Inicialmente sem features
        },
      },
      include: {
        features: true,
      },
    });
  },

  async updateProject(id: string, data: UpdateProjectData) {
    return prisma.testProject.update({
      where: { id },
      data,
      include: {
        features: true,
      },
    });
  },

  async deleteProject(id: string) {
    return prisma.testProject.delete({
      where: { id },
    });
  },

  async getProject(id: string) {
    return prisma.testProject.findUnique({
      where: { id },
      include: {
        features: true,
        history: {
          orderBy: {
            startTime: "desc",
          },
          take: 10, // Últimos 10 testes
        },
      },
    });
  },

  async getUserProjects(userId: string) {
    return prisma.testProject.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        features: true,
        history: {
          orderBy: {
            startTime: "desc",
          },
          take: 1, // Apenas o último teste
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  },

  async addFeature(data: CreateFeatureData) {
    return prisma.testFeature.create({
      data,
    });
  },

  async updateFeature(id: string, data: Partial<CreateFeatureData>) {
    return prisma.testFeature.update({
      where: { id },
      data,
    });
  },

  async deleteFeature(id: string) {
    return prisma.testFeature.delete({
      where: { id },
    });
  },

  async getProjectFeatures(projectId: string) {
    return prisma.testFeature.findMany({
      where: { projectId },
      orderBy: {
        category: "asc",
      },
    });
  },

  async searchProjects(userId: string, searchTerm: string) {
    return prisma.testProject.findMany({
      where: {
        userId,
        isActive: true,
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      include: {
        features: true,
      },
    });
  },
};
