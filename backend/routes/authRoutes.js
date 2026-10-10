import express from 'express';
import authController from '../controllers/authController.js';
import { 
    authenticateToken, 
    checkRole,
    isAdmin,
    rateLimitLogin 
} from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No Authentication)
// ============================================

// POST /api/auth/register - Register new user
router.post('/register', authController.register.bind(authController));

// POST /api/auth/login - Login user
router.post('/login', rateLimitLogin, authController.login.bind(authController));

// POST /api/auth/logout - Logout user
router.post('/logout', authController.logout.bind(authController));

// ============================================
// PROTECTED ROUTES (Authentication Required)
// ============================================

// GET /api/auth/me - Get current user
router.get(
    '/me',
    authenticateToken,
    authController.getCurrentUser.bind(authController)
);

// POST /api/auth/refresh - Refresh token
router.post(
    '/refresh',
    authenticateToken,
    authController.refreshToken.bind(authController)
);

// PUT /api/auth/change-password - Change password
router.put(
    '/change-password',
    authenticateToken,
    authController.changePassword.bind(authController)
);

// ============================================
// ADMIN ONLY ROUTES
// ============================================

// GET /api/auth/users - Get all users (Admin only)
router.get(
    '/users',
    authenticateToken,
    isAdmin,
    async (req, res) => {
        try {
            const db = (await import('../config/database.js')).default;
            const users = await db.collection('users').find({}).toArray();
            
            const safeUsers = users.map(user => {
                const { password, ...safeUser } = user;
                return safeUser;
            });

            res.json({
                success: true,
                data: safeUsers,
                total: safeUsers.length
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

// DELETE /api/auth/users/:id - Delete user (Admin only)
router.delete(
    '/users/:id',
    authenticateToken,
    isAdmin,
    async (req, res) => {
        try {
            const db = (await import('../config/database.js')).default;
            const userId = parseInt(req.params.id);

            const result = await db.collection('users').deleteOne({ id: userId });

            if (result.deletedCount === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            res.json({
                success: true,
                message: 'User deleted successfully'
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

    // create JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
export default router;
