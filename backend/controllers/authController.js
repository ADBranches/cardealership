import bcrypt from 'bcryptjs';
import db from '../config/database.js';
import { generateToken } from '../middleware/authMiddleware.js';

export const authController = {
    // ============================================
    // REGISTER NEW USER
    // POST /api/auth/register
    // ============================================
    async register(req, res) {
        try {
            const { name, email, password, phone, role = 'user' } = req.body;

            // Validate required fields
            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields',
                    required: ['name', 'email', 'password']
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid email format'
                });
            }

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
            // Validate password strength
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    error: 'Password must be at least 6 characters long'
                });
            }

            // Check if user already exists
            const existingUser = await db.collection('users').findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    error: 'User with this email already exists'
                });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user
            const newUser = {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                phone: phone || '',
                role: role === 'admin' ? 'admin' : 'user', // Only allow admin if specified
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const result = await db.collection('users').insertOne(newUser);
            const userId = result.insertedId;

    // Public registration always creates a customer account. Administrator
    // accounts must be provisioned through an authorized internal process.
    const normalizedRole = "user";

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser(
      name.trim(),
      normalizedEmail,
      hashedPassword,
      normalizedRole,
    );

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration failed:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed.",
      error: error.message,
    });
  }
};
            // Generate token
            const token = generateToken({
                id: userId,
                email: newUser.email,
                role: newUser.role,
                name: newUser.name
            });

            // Return success (don't include password)
            const { password: _, ...userWithoutPassword } = newUser;

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: { id: userId, ...userWithoutPassword },
                    token
                }
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                error: 'Registration failed',
                message: error.message
            });
        }
    },

    // ============================================
    // LOGIN USER
    // POST /api/auth/login
    // ============================================
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validate required fields
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Email and password are required'
                });
            }

            // Find user
            const user = await db.collection('users').findOne({ 
                email: email.toLowerCase() 
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }

            // Check password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }

            // Generate token
            const token = generateToken({
                id: user.id || user._id,
                email: user.email,
                role: user.role || 'user',
                name: user.name
            });

            // Return success (don't include password)
            const { password: _, ...userWithoutPassword } = user;

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: userWithoutPassword,
                    token
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                error: 'Login failed',
                message: error.message
            });
        }
    },

    // ============================================
    // GET CURRENT USER
    // GET /api/auth/me
    // ============================================
    async getCurrentUser(req, res) {
        try {
            const userId = req.user.id;
            const user = await db.collection('users').findOne({ 
                $or: [{ id: userId }, { _id: userId }]
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            const { password: _, ...userWithoutPassword } = user;

            res.json({
                success: true,
                data: userWithoutPassword
            });

        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    // ============================================
    // LOGOUT (Client-side token removal)
    // POST /api/auth/logout
    // ============================================
    async logout(req, res) {
        // JWT is stateless, so we just tell the client to remove the token
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    },

    // ============================================
    // REFRESH TOKEN
    // POST /api/auth/refresh
    // ============================================
    async refreshToken(req, res) {
        try {
            const userId = req.user.id;
            const user = await db.collection('users').findOne({ 
                $or: [{ id: userId }, { _id: userId }]
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            const token = generateToken({
                id: user.id || user._id,
                email: user.email,
                role: user.role || 'user',
                name: user.name
            });

            res.json({
                success: true,
                data: { token }
            });

        } catch (error) {
            console.error('Refresh token error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    // ============================================
    // CHANGE PASSWORD
    // PUT /api/auth/change-password
    // ============================================
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Current password and new password are required'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    error: 'New password must be at least 6 characters'
                });
            }

            const user = await db.collection('users').findOne({ 
                $or: [{ id: userId }, { _id: userId }]
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            // Verify current password
            const isValid = await bcrypt.compare(currentPassword, user.password);
            if (!isValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Current password is incorrect'
                });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Update password
            await db.collection('users').updateOne(
                { $or: [{ id: userId }, { _id: userId }] },
                { $set: { password: hashedPassword, updatedAt: new Date().toISOString() } }
            );

            res.json({
                success: true,
                message: 'Password changed successfully'
            });

        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
};

export default authController;