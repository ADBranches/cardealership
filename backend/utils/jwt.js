// backend/utils/jwt.js
import jwt from 'jsonwebtoken';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return secret;
}

export function signToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' });
}

export function verifyToken(token) {
  return jwt.verify(token, getSecret());
}

export function generateToken(payload) {
  return signToken(payload);
}

export default { signToken, verifyToken, generateToken };