import { Request, Response } from 'express';
import { ProjectService } from '../services/project.service.js';
import { ProjectRequest, ProjectStatus } from '../lib/types.js';

export class ProjectController {
  static async getAll(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

      const status = req.query.status as ProjectStatus;
      const limit = parseInt(String(req.query.limit || "10"));
      const offset = parseInt(String(req.query.offset || "0"));

      const { projects, total } = await ProjectService.getAllProjects(
        { userId: req.user.userId, role: req.user.role },
        { status, limit, offset }
      );

      return res.json({
        success: true,
        data: {
          projects,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total,
          },
        },
      });
    } catch (error: any) {
      console.error("Get projects error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

      const projectId = parseInt(req.params.id as string);
      if (isNaN(projectId) || projectId <= 0) {
        return res.status(400).json({ success: false, error: "Invalid project ID" });
      }

      const project = await ProjectService.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, error: "Project not found" });
      }

      // Check access for WORKER
      if (req.user.role === "WORKER" && project.createdById !== req.user.userId) {
        const hasAccess = await ProjectService.checkUserAccess(projectId, req.user.userId);
        if (!hasAccess) {
          return res.status(403).json({ success: false, error: "Access denied" });
        }
      }

      return res.json({ success: true, data: project });
    } catch (error: any) {
      console.error("Get project error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

      const body: ProjectRequest = req.body;
      if (!body.name || !body.startDate) {
        return res.status(400).json({ success: false, error: "Project name and start date are required" });
      }

      const project = await ProjectService.createProject(body, req.user.userId);
      return res.status(201).json({
        success: true,
        data: project,
        message: "Project created successfully",
      });
    } catch (error: any) {
      console.error("Create project error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

      const projectId = parseInt(req.params.id as string);
      if (isNaN(projectId)) {
        return res.status(400).json({ success: false, error: "Invalid project ID" });
      }

      const existingProject = await ProjectService.getProjectById(projectId);
      if (!existingProject) {
        return res.status(404).json({ success: false, error: "Project not found" });
      }

      // Only admin or project creator can update
      if (req.user.role !== "ADMIN" && existingProject.createdById !== req.user.userId) {
        return res.status(403).json({ success: false, error: "You can only update projects you created" });
      }

      const body: Partial<ProjectRequest> = req.body;
      const project = await ProjectService.updateProject(projectId, body);

      return res.json({
        success: true,
        data: project,
        message: "Project updated successfully",
      });
    } catch (error: any) {
      console.error("Update project error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

      const projectId = parseInt(req.params.id as string);
      if (isNaN(projectId)) {
        return res.status(400).json({ success: false, error: "Invalid project ID" });
      }

      const existingProject = await ProjectService.getProjectById(projectId);
      if (!existingProject) {
        return res.status(404).json({ success: false, error: "Project not found" });
      }

      await ProjectService.deleteProject(projectId);
      return res.json({
        success: true,
        message: "Project deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete project error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }
}
