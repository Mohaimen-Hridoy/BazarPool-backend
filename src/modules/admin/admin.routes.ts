import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { authenticateJWT, requireRole } from '../../middleware/auth.js';

const router = Router();

// Publicly allow viewing hubs for campaign creation & pickup selection
router.get('/hubs', AdminController.getHubs);

// Protected Admin / Coordinator operations
router.post('/hubs', authenticateJWT, requireRole('ADMIN'), AdminController.createHub);
router.get('/stats', authenticateJWT, requireRole('ADMIN'), AdminController.getStats);

export default router;
