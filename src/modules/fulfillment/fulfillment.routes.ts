import { Router } from 'express';
import { FulfillmentController } from './fulfillment.controller.js';
import { authenticateJWT, requireRole } from '../../middleware/auth.js';

const router = Router();

router.post(
  '/:campaignId/dispatch',
  authenticateJWT,
  requireRole('SUPPLIER', 'ADMIN'),
  FulfillmentController.dispatch
);

router.post(
  '/:campaignId/arrive-at-hub',
  authenticateJWT,
  requireRole('HUB_COORDINATOR', 'ADMIN', 'SUPPLIER'),
  FulfillmentController.arriveAtHub
);

router.post(
  '/verify-pickup',
  authenticateJWT,
  requireRole('HUB_COORDINATOR', 'ADMIN'),
  FulfillmentController.verifyPickup
);

export default router;
