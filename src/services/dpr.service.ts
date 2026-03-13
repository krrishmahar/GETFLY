import { prisma } from '../lib/prisma.js';
import { DPRRequest } from '../lib/types.js';

export class DPRService {
  static async getDPRsByProject(projectId: number, filters: { date?: string, limit: number, offset: number }) {
    const { date: dateParam, limit, offset } = filters;
    const where: any = { projectId };

    if (dateParam) {
      const date = new Date(dateParam);
      where.date = {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setDate(date.getDate() + 1)),
      };
    }

    const [dprs, total] = await Promise.all([
      prisma.dailyReport.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { date: "desc" },
      }),
      prisma.dailyReport.count({ where }),
    ]);

    return { dprs, total };
  }

  static async createDPR(projectId: number, userId: number, data: DPRRequest) {
    return prisma.dailyReport.create({
      data: {
        projectId,
        userId,
        date: new Date(data.date),
        workDescription: data.workDescription,
        weather: data.weather || null,
        workerCount: data.workerCount,
        challenges: data.challenges || null,
        materialsUsed: data.materialsUsed || null,
        equipmentUsed: data.equipmentUsed || null,
        safetyIncidents: data.safetyIncidents || null,
        nextDayPlan: data.nextDayPlan || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });
  }
}
