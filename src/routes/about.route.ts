import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    project: {
      name: "GETFLY_BACKEND",
      version: process.env.npm_package_version ?? "1.0.0",
      description: "Node.js Express backend powered by Prisma and Express for purpose of daily report management",
      repository: "https://github.com/krrishmahar/GETFLY",
      stack: ["Node.js", "Express", "NeonDB", "Prisma", "PostgreSQL"],
    },
    developer: {
      name: "Krrish Mahar",
      github: "https://github.com/krrishmahar",
    },
  });
});

export default router;
