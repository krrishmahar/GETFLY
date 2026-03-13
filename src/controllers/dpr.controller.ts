import { Request, Response } from 'express';
import { DPRService } from '../services/dpr.service.js';
import { ProjectService } from '../services/project.service.js';
import { DPRRequest } from '../lib/types.js';

export class DPRController {
  static async getByProject(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

      const projectId = parseInt(req.params.id as string);
      if (isNaN(projectId)) {
        return res.status(400).json({ success: false, error: "Invalid project ID" });
      }

      // Check if project exists
      const project = await ProjectService.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, error: "Project not found" });
      }

      // Check access
      if (req.user.role === "WORKER" && project.createdById !== req.user.userId) {
        const hasAccess = await ProjectService.checkUserAccess(projectId, req.user.userId);
        if (!hasAccess) {
          return res.status(403).json({ success: false, error: "Access denied" });
        }
      }

      const date = req.query.date as string;
      const limit = parseInt(String(req.query.limit || "50"));
      const offset = parseInt(String(req.query.offset || "0"));

      const { dprs, total } = await DPRService.getDPRsByProject(projectId, { date, limit, offset });

      return res.json({
        success: true,
        data: {
          dprs,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total,
          },
        },
      });
    } catch (error: any) {
      console.error("Get DPRs error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

      const projectId = parseInt(req.params.id as string);
      if (isNaN(projectId)) {
        return res.status(400).json({ success: false, error: "Invalid project ID" });
      }

      const body: DPRRequest = req.body;
      if (!body.date || !body.workDescription || body.workerCount === undefined) {
        return res.status(400).json({ success: false, error: "Date, work description, and worker count are required" });
      }

      const project = await ProjectService.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, error: "Project not found" });
      }

      // Check access
      if (req.user.role === "WORKER" && project.createdById !== req.user.userId) {
        return res.status(403).json({ success: false, error: "You can only add DPRs to projects you created" });
      }

      const dpr = await DPRService.createDPR(projectId, req.user.userId, body);

      return res.status(201).json({
        success: true,
        data: dpr,
        message: "Daily Progress Report created successfully",
      });
    } catch (error: any) {
      console.error("Create DPR error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }
}
