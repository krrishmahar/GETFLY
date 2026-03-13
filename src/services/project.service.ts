import { prisma } from '../lib/prisma.js';
import { ProjectRequest, ProjectStatus, UserRole } from '../lib/types.js';

export class ProjectService {
  static async getAllProjects(user: { userId: number, role: string }, filters: { status?: ProjectStatus, limit: number, offset: number }) {
    const { status, limit, offset } = filters;
    const where: any = {};
    
    if (status) {
      where.status = status;
    }

    if (user.role === "WORKER") {
      const userProjects = await prisma.dailyReport.findMany({
        where: { userId: user.userId },
        select: { projectId: true },
        distinct: ["projectId"],
      });
      where.id = { in: userProjects.map((p: { projectId: number }) => p.projectId) };
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: { dailyReports: true },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.count({ where }),
    ]);

    return { projects, total };
  }

  static async getProjectById(id: number) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        dailyReports: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { date: "desc" },
        },
      },
    });
  }

  static async createProject(data: ProjectRequest, userId: number) {
    return prisma.project.create({
      data: {
        name: data.name,
        description: data.description || null,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        budget: data.budget || null,
        location: data.location || null,
        status: (data.status || "PLANNED") as ProjectStatus,
        createdById: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  static async updateProject(id: number, data: Partial<ProjectRequest>) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.budget !== undefined) updateData.budget = data.budget;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.status !== undefined) updateData.status = data.status as ProjectStatus;

    return prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  static async deleteProject(id: number) {
    return prisma.$transaction(async (tx) => {
      // Delete associated reports first due to foreign key constraint
      await tx.dailyReport.deleteMany({
        where: { projectId: id },
      });

      // Then delete the project
      return tx.project.delete({
        where: { id },
      });
    });
  }

  static async checkUserAccess(projectId: number, userId: number) {
    return prisma.dailyReport.findFirst({
      where: {
        projectId,
        userId: userId,
      },
    });
  }
}
