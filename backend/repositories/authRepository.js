import db from "../config/db.js";

export const AUTH_USER_COLUMNS = `
  id, name, email, password, role,
  email_verified, email_verified_at,
  email_verification_token_hash, email_verification_expires_at,
  password_reset_token_hash, password_reset_expires_at,
  token_version, password_updated_at,
  failed_login_attempts, locked_until,
  created_at, updated_at
`;

export async function findUserByEmail(email) {
  const result = await db.query(`SELECT ${AUTH_USER_COLUMNS} FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`, [email]);
  return result.rows[0] ?? null;
}

export async function findUserById(id) {
  const result = await db.query(`SELECT ${AUTH_USER_COLUMNS} FROM users WHERE id = $1 LIMIT 1`, [id]);
  return result.rows[0] ?? null;
}

export async function createUser(name, email, passwordHash, role = "user") {
  const safeRole = role === "admin" ? "admin" : "user";
  const result = await db.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING ${AUTH_USER_COLUMNS}`,
    [name, email, passwordHash, safeRole],
  );
  return result.rows[0];
}

export async function setEmailVerificationToken(userId, tokenHash, expiresAt) {
  await db.query(
    `UPDATE users SET email_verification_token_hash = $2, email_verification_expires_at = $3, updated_at = NOW() WHERE id = $1`,
    [userId, tokenHash, expiresAt],
  );
}

export async function setPasswordResetToken(userId, tokenHash, expiresAt) {
  await db.query(
    `UPDATE users SET password_reset_token_hash = $2, password_reset_expires_at = $3, updated_at = NOW() WHERE id = $1`,
    [userId, tokenHash, expiresAt],
  );
}

export async function incrementTokenVersion(userId) {
  const result = await db.query(
    `UPDATE users SET token_version = token_version + 1, updated_at = NOW() WHERE id = $1 RETURNING token_version`,
    [userId],
  );
  return result.rows[0]?.token_version ?? null;
}

export async function recordFailedLogin(userId, lockedUntil = null) {
  await db.query(
    `UPDATE users SET failed_login_attempts = failed_login_attempts + 1, locked_until = COALESCE($2, locked_until), updated_at = NOW() WHERE id = $1`,
    [userId, lockedUntil],
  );
}

export async function clearFailedLogins(userId) {
  await db.query(
    `UPDATE users SET failed_login_attempts = 0, locked_until = NULL, updated_at = NOW() WHERE id = $1`,
    [userId],
  );
}
