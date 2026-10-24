import { Router } from 'express';
import { CommitmentController } from './commitments.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import { createCommitmentSchema } from './commitments.validation.js';
import { authenticateJWT, requireRole } from '../../middleware/auth.js';

const router = Router();

router.post(
  '/:campaignId',
  authenticateJWT,
  requireRole('CONSUMER', 'ADMIN'),
  validateRequest(createCommitmentSchema),
  CommitmentController.commit
);

router.get('/me', authenticateJWT, CommitmentController.getMyCommitments);
router.post('/:commitmentId/cancel', authenticateJWT, CommitmentController.cancel);

export default router;
