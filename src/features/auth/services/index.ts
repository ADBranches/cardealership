export {
  clearAuthToken,
  clearStoredSession,
  getAuthenticatedUser,
  getAuthToken,
  getStoredSession,
  isAuthenticated,
  login,
  register,
  restoreStoredSession,
  saveSession,
  verifySession,
} from "./authService";

export { AUTH_SESSION_VERIFICATION_ENDPOINT, createAuthorizationHeaders } from "./authApi";
export type { AuthStorage } from "./authStorage";
