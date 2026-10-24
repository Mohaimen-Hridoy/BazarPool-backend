import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import { registerSchema, loginSchema } from './auth.validation.js';
import { authenticateJWT } from '../../middleware/auth.js';

const router = Router();

router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.get('/me', authenticateJWT, AuthController.getMe);

export default router;
