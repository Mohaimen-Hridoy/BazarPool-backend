import { Router } from 'express';
import { CampaignController } from './campaigns.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import { createCampaignSchema } from './campaigns.validation.js';
import { authenticateJWT, requireRole } from '../../middleware/auth.js';

const router = Router();

router.get('/', CampaignController.getAll);
router.get('/:id', CampaignController.getById);

router.post(
  '/',
  authenticateJWT,
  requireRole('SUPPLIER', 'ADMIN'),
  validateRequest(createCampaignSchema),
  CampaignController.create
);

export default router;
