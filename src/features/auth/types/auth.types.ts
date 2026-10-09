export type AuthRole = "user" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: AuthRole;
  isAdmin?: boolean;
  emailVerified?: boolean;
  emailVerifiedAt?: string | null;
}

export interface LoginCredentials { email: string; password: string; }
export interface RegisterCredentials { firstName: string; lastName: string; email: string; password: string; }
export interface ForgotPasswordRequest { email: string; }
export interface ResetPasswordRequest { token: string; password: string; }
export interface VerifyEmailRequest { token: string; }
export interface ResendVerificationRequest { email: string; }

export type AuthErrorCode =
  | "AUTH_VALIDATION_FAILED"
  | "AUTHENTICATION_REQUIRED"
  | "UNAUTHORIZED"
  | "INVALID_CREDENTIALS"
  | "TOKEN_EXPIRED"
  | "INVALID_TOKEN"
  | "ACCOUNT_LOCKED"
  | "RATE_LIMITED"
  | "AUTH_CONFLICT"
  | "AUTH_SERVICE_UNAVAILABLE"
  | "SESSION_VERIFICATION_FAILED";

export interface AuthError { code: AuthErrorCode; message: string; status?: number; details?: Record<string, unknown> | null; }
export interface AuthSession { accessToken: string; user: AuthUser; }
export interface AuthState { user: AuthUser | null; accessToken: string | null; isAuthenticated: boolean; isRestoringSession: boolean; isAuthReady: boolean; error: AuthError | null; }
export interface AuthSuccessResponse<T> { success: true; message: string; data: T; }
export interface AuthFailureResponse { success: false; error: AuthError; }
export type AuthResponse<T> = AuthSuccessResponse<T> | AuthFailureResponse;
export interface AuthSessionPayload { token: string; user: AuthUser; }
export interface VerifySessionSuccess { valid: true; user: AuthUser; }
export interface VerifySessionFailure { valid: false; code: AuthErrorCode; message?: string; }
export type VerifySessionResult = VerifySessionSuccess | VerifySessionFailure;

export const AUTH_STORAGE_KEYS = { accessToken: "token", user: "user", legacyAccessTokens: ["authToken", "jwt", "accessToken"], legacyRole: "role", legacyIsAdmin: "isAdmin" } as const;
