// backend/middleware/authMiddleware.js

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
// This middleware handles JWT authentication for protected routes

import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "panda_motors_secret_key_2026";

// ============================================
// Middleware: Authenticate Token
// ============================================
// Verifies the JWT token from the Authorization header

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,

      error: {
        code: "AUTHENTICATION_REQUIRED",
        message: "Access denied. No token provided.",
        status: 401,
        details: null,
      },
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,

        error: {
          code: "TOKEN_EXPIRED",
          message: "Token has expired. Please login again.",
          status: 401,
          details: null,
        },
      });
    }

    return res.status(401).json({
      success: false,

      error: {
        code: "INVALID_TOKEN",
        message: "Invalid token. Access denied.",
        status: 401,
        details: null,
      },
    });
  }
};

// ============================================
// Middleware: Check User Role
// ============================================
// Verifies the user has one of the allowed roles

export const checkRole = (allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,

      error: {
        code: "AUTHENTICATION_REQUIRED",

        message: "Authentication required.",

        status: 401,

        details: null,
      },
    });
  }

  const userRole = req.user.role || "user";

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({
      success: false,

      error: {
        code: "ADMIN_ACCESS_REQUIRED",

        message: "Access denied. Insufficient permissions.",

        status: 403,

        details: {
          requiredRoles: allowedRoles,

          yourRole: userRole,
        },
      },
    });
  }

  return next();
};

// ============================================
// Middleware: Optional Authentication
// ============================================
// Tries to authenticate but does not require it

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

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

  return next();
};

// ============================================
// Helper: Generate JWT Token
// ============================================

export const generateToken = (user) => {
  const payload = {
    id: user.id || user._id,

    email: user.email,

    role: user.role || "user",

    name: user.name || user.user_name,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
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
// Helper: Decode Token
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

  const recentAttempts = attempts.filter((time) => now - time < 15 * 60 * 1000);

  if (recentAttempts.length >= 5) {
    return res.status(429).json({
      success: false,

      error: {
        code: "TOO_MANY_LOGIN_ATTEMPTS",

        message: "Too many login attempts. Please try again in 15 minutes.",

        status: 429,

        details: null,
      },
    });
  }

  recentAttempts.push(now);

  loginAttempts.set(ip, recentAttempts);

  return next();
};

// ============================================
// ROUTE-FRIENDLY ALIASES
// ============================================
//
// server.js expects:
//
// protect
// adminOnly
//
// protect = authenticateToken
//
// adminOnly = role checker restricted to admin
//

export const protect = authenticateToken;

export const adminOnly = checkRole(["admin"]);

// ============================================
// Export all middleware
// ============================================

export default {
  authenticateToken,
  protect,
  checkRole,
  adminOnly,
  optionalAuth,
  generateToken,
  verifyToken,
  decodeToken,
  rateLimitLogin,
};
