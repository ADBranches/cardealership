import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'panda_motors_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ============================================
// AUTHENTICATE TOKEN MIDDLEWARE
// ============================================
export const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.',
                code: 'NO_TOKEN'
            });
        }

        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({
                        success: false,
                        error: 'Token has expired. Please login again.',
                        code: 'TOKEN_EXPIRED'
                    });
                }
                if (err.name === 'JsonWebTokenError') {
                    return res.status(403).json({
                        success: false,
                        error: 'Invalid token. Access denied.',
                        code: 'INVALID_TOKEN'
                    });
                }
                return res.status(403).json({
                    success: false,
                    error: 'Token verification failed.',
                    code: 'TOKEN_FAILED'
                });
            }

            // Attach user info to request
            req.user = decoded;
            next();
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Authentication error',
            message: error.message
        });
    }
};

// ============================================
// ROLE CHECK MIDDLEWARE
// ============================================
export const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required.',
                code: 'NO_USER'
            });
        }

        const userRole = req.user.role || 'user';
        
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Insufficient permissions.',
                code: 'INSUFFICIENT_ROLE',
                requiredRoles: allowedRoles,
                yourRole: userRole
            });
        }

        next();
    };
};

// ============================================
// ADMIN ONLY MIDDLEWARE
// ============================================
export const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required.',
            code: 'NO_USER'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required.',
            code: 'ADMIN_REQUIRED',
            yourRole: req.user.role
        });
    }

    next();
};

// ============================================
// OPTIONAL AUTHENTICATION
// ============================================
export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        } catch (error) {
            req.user = null;
        }
    } else {
        req.user = null;
    }

    next();
};

// ============================================
// GENERATE JWT TOKEN
// ============================================
export const generateToken = (user) => {
    const payload = {
        id: user.id || user._id,
        email: user.email,
        role: user.role || 'user',
        name: user.name || user.user_name
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

// ============================================
// VERIFY TOKEN
// ============================================
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// ============================================
// DECODE TOKEN (Without Verification)
// ============================================
export const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        return null;
    }
};

// ============================================
// RATE LIMITING FOR LOGIN
// ============================================
const loginAttempts = new Map();

export const rateLimitLogin = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!loginAttempts.has(ip)) {
        loginAttempts.set(ip, []);
    }
    
    const attempts = loginAttempts.get(ip);
    const recentAttempts = attempts.filter(time => now - time < 15 * 60 * 1000);
    
    if (recentAttempts.length >= 5) {
        return res.status(429).json({
            success: false,
            error: 'Too many login attempts. Please try again in 15 minutes.',
            code: 'RATE_LIMITED'
        });
    }
    
    recentAttempts.push(now);
    loginAttempts.set(ip, recentAttempts);
    
    next();
};

// ============================================
// EXPORT ALL
// ============================================
export default {
    authenticateToken,
    checkRole,
    isAdmin,
    optionalAuth,
    generateToken,
    verifyToken,
    decodeToken,
    rateLimitLogin
};