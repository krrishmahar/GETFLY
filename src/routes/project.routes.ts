import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import dprRoutes from './dpr.routes.js';

const router = Router();

// All project routes require authentication
router.use(authenticate);

// Nest DPR routes
router.use('/:id/dpr', dprRoutes);

router.get('/', ProjectController.getAll);
router.get('/:id', ProjectController.getById);

// Creation, update and deletion require ADMIN or MANAGER role
router.post('/', authorize(['ADMIN', 'MANAGER']), ProjectController.create);
router.put('/:id', authorize(['ADMIN', 'MANAGER']), ProjectController.update);
router.delete('/:id', authorize(['ADMIN']), ProjectController.delete);

export default router;
