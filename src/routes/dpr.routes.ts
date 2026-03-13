import { Router } from 'express';
import { DPRController } from '../controllers/dpr.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

// All DPR routes require authentication
router.use(authenticate);

router.get('/', DPRController.getByProject);
router.post('/', DPRController.create);

export default router;
