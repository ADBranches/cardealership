// backend/routes/authRoutes.js
import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken, isAdmin, rateLimitLogin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.post('/register', authController.register);
router.post('/login', rateLimitLogin, authController.login);
router.post('/logout', authController.logout);

// Protected
router.get('/me', authenticateToken, authController.me);
router.get('/session', authenticateToken, authController.me);
router.post('/refresh', authenticateToken, authController.refreshToken);
router.put('/change-password', authenticateToken, authController.changePassword);

// Admin
router.get('/users', authenticateToken, isAdmin, authController.getAllUsers);
router.delete('/users/:id', authenticateToken, isAdmin, authController.deleteUser);

export default router;