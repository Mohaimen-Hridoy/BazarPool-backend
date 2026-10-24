import { Router } from 'express';
import { WalletController } from './wallet.controller.js';
import { authenticateJWT } from '../../middleware/auth.js';

const router = Router();

router.get('/', authenticateJWT, WalletController.getDetails);
router.post('/top-up', authenticateJWT, WalletController.topUp);

export default router;
