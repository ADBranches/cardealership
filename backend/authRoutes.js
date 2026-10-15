// backend/routes/authRoutes.js
import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken, isAdmin, rateLimitLogin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', rateLimitLogin, authController.login);
router.post('/logout', authController.logout);

router.get('/me', authenticateToken, authController.me);
router.post('/refresh', authenticateToken, authController.refreshToken);
router.put('/change-password', authenticateToken, authController.changePassword);

router.get('/users', authenticateToken, isAdmin, authController.getAllUsers);
router.delete('/users/:id', authenticateToken, isAdmin, authController.deleteUser);

export default router;