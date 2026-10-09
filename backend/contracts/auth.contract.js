export const AUTH_ROLES = Object.freeze(["user", "admin"]);

export const AUTH_ENDPOINTS = Object.freeze({
  register: "/api/auth/register",
  login: "/api/auth/login",
  session: "/api/auth/session",
  logout: "/api/auth/logout",
  verifyEmail: "/api/auth/verify-email",
  resendVerification: "/api/auth/resend-verification",
  forgotPassword: "/api/auth/forgot-password",
  resetPassword: "/api/auth/reset-password",
});

export const AUTH_ERROR_CODES = Object.freeze({
  validationFailed: "AUTH_VALIDATION_FAILED",
  authenticationRequired: "AUTHENTICATION_REQUIRED",
  invalidCredentials: "INVALID_CREDENTIALS",
  invalidToken: "INVALID_TOKEN",
  tokenExpired: "TOKEN_EXPIRED",
  accountLocked: "ACCOUNT_LOCKED",
  rateLimited: "RATE_LIMITED",
  conflict: "AUTH_CONFLICT",
  unavailable: "AUTH_SERVICE_UNAVAILABLE",
});

export const createAuthError = (code, message, status, details = null) => ({
  success: false,
  error: { code, message, status, details },
});

export const createAuthSuccess = (message, data = null) => ({
  success: true,
  message,
  ...(data === null ? {} : { data }),
});

export const toPublicAuthUser = (user) => ({
  id: String(user.id),
  name: user.name,
  email: user.email,
  role: AUTH_ROLES.includes(user.role) ? user.role : "user",
  emailVerified: Boolean(user.email_verified),
  emailVerifiedAt: user.email_verified_at ?? null,
});
