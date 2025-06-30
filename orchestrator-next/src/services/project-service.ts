import { prisma } from "@/lib/prisma";

export interface CreateProjectData {
  userId: string;
  name: string;
  path: string;
  description?: string;
  type: string;
  framework: string;
  teamId?: string;
}

export interface UpdateProjectData {
  name?: string;
  path?: string;
  description?: string;
  type?: string;
  framework?: string;
  teamId?: string;
  isActive?: boolean;
}

export const projectService = {
  async createProject(data: CreateProjectData) {
    return prisma.testProject.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  },

  async updateProject(id: string, data: UpdateProjectData) {
    return prisma.testProject.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
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
          take: 10,
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
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  },

  async getTeamProjects(teamId: string) {
    return prisma.testProject.findMany({
      where: {
        teamId,
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
      orderBy: {
        updatedAt: "desc",
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
        history: {
          orderBy: {
            startTime: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  },

  async addFeature(
    projectId: string,
    featureData: {
      name: string;
      path: string;
      type: string;
      category: string;
      dataFiles?: string[];
      description?: string;
      tags?: string[];
    }
  ) {
    return prisma.testFeature.create({
      data: {
        ...featureData,
        projectId,
      },
    });
  },

  async updateFeature(
    featureId: string,
    featureData: {
      name?: string;
      path?: string;
      type?: string;
      category?: string;
      dataFiles?: string[];
      description?: string;
      tags?: string[];
    }
  ) {
    return prisma.testFeature.update({
      where: { id: featureId },
      data: featureData,
    });
  },

  async deleteFeature(featureId: string) {
    return prisma.testFeature.delete({
      where: { id: featureId },
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
};
