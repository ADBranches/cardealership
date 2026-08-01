// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
// This middleware handles JWT authentication for protected routes

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'panda_motors_secret_key_2026';

// ============================================
// Middleware: Authenticate Token
// ============================================
// Verifies the JWT token from the Authorization header
export const authenticateToken = (req, res, next) => {
    // Get the token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Access denied. No token provided.'
        });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user info to request
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token has expired. Please login again.'
            });
        }
        return res.status(403).json({
            success: false,
            error: 'Invalid token. Access denied.'
        });
    }
};

// ============================================
// Middleware: Check User Role
// ============================================
// Verifies the user has the required role
export const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required.'
            });
        }

        const userRole = req.user.role || 'user';
        
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Insufficient permissions.',
                requiredRoles: allowedRoles,
                yourRole: userRole
            });
        }

        next();
    };
};

// ============================================
// Middleware: Optional Authentication
// ============================================
// Tries to authenticate but doesn't require it
export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        } catch (error) {
            // Token is invalid but we don't block the request
            req.user = null;
        }
    } else {
        req.user = null;
    }

    next();
};

// ============================================
// Helper: Generate JWT Token
// ============================================
export const generateToken = (user) => {
    const payload = {
        id: user.id || user._id,
        email: user.email,
        role: user.role || 'user',
        name: user.name || user.user_name
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '7d' // Token expires in 7 days
    });
};

// ============================================
// Helper: Verify Token
// ============================================
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// ============================================
// Helper: Decode Token (without verification)
// ============================================
export const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        return null;
    }
};

// ============================================
// Middleware: Rate Limiting for Auth Routes
// ============================================
const loginAttempts = new Map();

export const rateLimitLogin = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!loginAttempts.has(ip)) {
        loginAttempts.set(ip, []);
    }
    
    const attempts = loginAttempts.get(ip);
    
    // Remove attempts older than 15 minutes
    const recentAttempts = attempts.filter(time => now - time < 15 * 60 * 1000);
    
    if (recentAttempts.length >= 5) {
        return res.status(429).json({
            success: false,
            error: 'Too many login attempts. Please try again in 15 minutes.'
        });
    }
    
    recentAttempts.push(now);
    loginAttempts.set(ip, recentAttempts);
    
    next();
};

// ============================================
// Export all middleware
// ============================================
export default {
    authenticateToken,
    checkRole,
    optionalAuth,
    generateToken,
    verifyToken,
    decodeToken,
    rateLimitLogin
};