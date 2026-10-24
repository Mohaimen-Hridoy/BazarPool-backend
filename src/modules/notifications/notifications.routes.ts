import { Router } from 'express';
import { NotificationController } from './notifications.controller.js';
import { authenticateJWT } from '../../middleware/auth.js';

const router = Router();

router.get('/', authenticateJWT, NotificationController.getNotifications);
router.patch('/:id/read', authenticateJWT, NotificationController.markAsRead);
router.patch('/read-all', authenticateJWT, NotificationController.markAllAsRead);

export default router;

