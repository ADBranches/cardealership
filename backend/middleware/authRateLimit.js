import { createAuthError, AUTH_ERROR_CODES } from "../contracts/auth.contract.js";

const fallbackAttempts = new Map();
const maxAttempts = Number(process.env.AUTH_LOGIN_MAX_ATTEMPTS || 5);
const windowMs = Number(process.env.AUTH_LOGIN_WINDOW_MS || 15 * 60 * 1000);

function getClientKey(req) {
  const forwarded = req.headers?.["x-forwarded-for"];
  const address = Array.isArray(forwarded) ? forwarded[0] : String(forwarded || req.ip || req.socket?.remoteAddress || "unknown").split(",")[0];
  return address.trim().slice(0, 128);
}

export function createLoginRateLimiter({ store = fallbackAttempts, now = () => Date.now() } = {}) {
  return function loginRateLimit(req, res, next) {
    const key = getClientKey(req);
    const current = now();
    const recent = (store.get(key) || []).filter((attempt) => current - attempt < windowMs);
    if (recent.length >= maxAttempts) {
      const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (current - recent[0])) / 1000));
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json(createAuthError(AUTH_ERROR_CODES.rateLimited, "Too many login attempts. Please wait and try again.", 429, { retryAfterSeconds }));
    }
    recent.push(current);
    store.set(key, recent);
    return next();
  };
}

export const loginRateLimit = createLoginRateLimiter();
export function clearLoginRateLimitFallback() { fallbackAttempts.clear(); }
