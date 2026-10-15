// backend/controllers/authController.js
import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { signToken } from '../utils/jwt.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ------- REGISTER -------
export async function register(req, res) {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, email and password are required' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, 'user')
       RETURNING id, name, email, role, created_at`,
      [name.trim(), normalizedEmail, passwordHash]
    );

    const user = result.rows[0];
    const token = signToken({ id: user.id, role: user.role });

    res.status(201).json({ success: true, message: 'Registered successfully', user, token });
  } catch (err) {
    console.error('register error:', err.message);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
}

// ------- LOGIN -------
export async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' });
    }

    const result = await db.query(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = signToken({ id: user.id, role: user.role });

    res.json({ success: true, message: 'Login successful', user: safeUser, token });
  } catch (err) {
    console.error('login error:', err.message);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
}

// ------- ME -------
export async function me(req, res) {
  res.json({ success: true, user: req.user });
}

// ------- LOGOUT -------
export async function logout(req, res) {
  res.json({ success: true, message: 'Logged out successfully' });
}

// ------- REFRESH TOKEN -------
export async function refreshToken(req, res) {
  const token = signToken({ id: req.user.id, role: req.user.role });
  res.json({ success: true, token });
}

// ------- CHANGE PASSWORD -------
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'currentPassword and newPassword are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const result = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    const hash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hash, req.user.id]);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('changePassword error:', err.message);
    res.status(500).json({ success: false, message: 'Change password failed' });
  }
}

// ------- ADMIN: GET ALL USERS -------
export async function getAllUsers(req, res) {
  try {
    const result = await db.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, count: result.rows.length, users: result.rows });
  } catch (err) {
    console.error('getAllUsers error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
}

// ------- ADMIN: DELETE USER -------
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM users WHERE id = ? RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    console.error('deleteUser error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
}