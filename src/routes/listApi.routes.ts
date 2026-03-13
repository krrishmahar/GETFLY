import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  const apiList = {
    project: "GETFLY_BACKEND",
    version: "1.0.0",
    description: "Construction Field Management System API Documentation",
    endpoints: [
      {
        category: "System",
        routes: [
          { method: "GET", path: "/health", description: "System health and database status" },
          { method: "GET", path: "/about", description: "Project information and developer details" },
          { method: "GET", path: "/list-api", description: "Detailed list of all available API endpoints" }
        ]
      },
      {
        category: "Authentication",
        routes: [
          { method: "POST", path: "/api/auth/register", description: "Register a new user (ADMIN, MANAGER, WORKER)" },
          { method: "POST", path: "/api/auth/login", description: "Authenticate user and receive JWT" }
        ]
      },
      {
        category: "Projects",
        routes: [
          { method: "GET", path: "/api/projects", description: "List all projects (filtered by role and status)" },
          { method: "POST", path: "/api/projects", description: "Create a new project (Admin/Manager only)" },
          { method: "GET", path: "/api/projects/:id", description: "Get detailed information about a specific project" },
          { method: "PUT", path: "/api/projects/:id", description: "Update project details (Admin/Manager only)" },
          { method: "DELETE", path: "/api/projects/:id", description: "Delete a project (Admin/Manager only, includes cascaded delete for reports)" }
        ]
      },
      {
        category: "Daily Progress Reports (DPRs)",
        routes: [
          { method: "GET", path: "/api/projects/:id/dpr", description: "List all daily reports for a specific project" },
          { method: "POST", path: "/api/projects/:id/dpr", description: "Submit a new daily progress report" }
        ]
      }
    ],
    live_demo: "https://getfly.onrender.com/list-api",
    repository: "https://github.com/krrishmahar/GETFLY"
  };

  res.status(200).json(apiList);
});

export default router;
