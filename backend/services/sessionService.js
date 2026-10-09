import { findUserById } from "../repositories/authRepository.js";

export const SESSION_ERROR_CODES = Object.freeze({
  required: "AUTHENTICATION_REQUIRED",
  expired: "TOKEN_EXPIRED",
  invalid: "INVALID_TOKEN",
  revoked: "SESSION_REVOKED",
});

export async function validateSessionPayload(payload) {
  if (!payload || !payload.id || !Number.isInteger(Number(payload.tokenVersion))) {
    return { valid: false, code: SESSION_ERROR_CODES.invalid };
  }
  const user = await findUserById(payload.id);
  if (!user) return { valid: false, code: SESSION_ERROR_CODES.revoked };
  if (Number(payload.tokenVersion) !== Number(user.token_version || 0)) {
    return { valid: false, code: SESSION_ERROR_CODES.revoked };
  }
  return { valid: true, user };
}

export function sessionErrorBody(code, message) {
  return { success: false, error: { code, message, status: 401, details: null } };
}
