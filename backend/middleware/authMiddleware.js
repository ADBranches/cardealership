// backend/middleware/authMiddleware.js
import db from '../config/db.js';
import { verifyToken } from '../utils/jwt.js';

// In-memory login rate limiter
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export function rateLimitLogin(req, res, next) {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const record = loginAttempts.get(key) || { count: 0, start: now };

  if (now - record.start > WINDOW_MS) {
    record.count = 0;
    record.start = now;
  }

  record.count += 1;
  loginAttempts.set(key, record);

  if (record.count > MAX_ATTEMPTS) {
    return res.status(429).json({ success: false, message: 'Too many login attempts. Try again later.' });
  }

  next();
}

export async function authenticateToken(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = header.slice(7);
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    const result = await db.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [decoded.id]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('auth error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}

export const requireAdmin = isAdmin;

// Compatibility aliases used by the modular route packages.
// Both aliases preserve the canonical authentication and administrator checks.
export const protect = authenticateToken;
export const adminOnly = isAdmin;
