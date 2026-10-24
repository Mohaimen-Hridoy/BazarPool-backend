import { Router } from 'express';
import { ProductController } from './products.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import { createProductSchema } from './products.validation.js';
import { authenticateJWT, requireRole } from '../../middleware/auth.js';

const router = Router();

router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);

router.post(
  '/',
  authenticateJWT,
  requireRole('SUPPLIER', 'ADMIN'),
  validateRequest(createProductSchema),
  ProductController.create
);

export default router;
