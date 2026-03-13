import './config/env.js';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { prisma } from './lib/prisma.js';
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import aboutRoutes from './routes/about.route.js';
import listApiRoutes from './routes/listApi.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/about', aboutRoutes);
app.use('/list-api', listApiRoutes);

// Base route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Field Management API is running' });
});

// Health check
app.get('/health', async (req: Request, res: Response) => {
  try {
    if (!prisma) {
      return res.status(500).json({ status: 'error', database: 'disconnected', reason: 'Prisma not initialized' });
    }
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;
