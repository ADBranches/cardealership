export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  isAdmin?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export type AuthErrorCode =
  | "UNAUTHORIZED"
  | "TOKEN_EXPIRED"
  | "INVALID_TOKEN"
  | "SESSION_VERIFICATION_FAILED";

export interface AuthError {
  code: AuthErrorCode;
  message: string;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isRestoringSession: boolean;
  isAuthReady: boolean;
  error: AuthError | null;
}

export interface VerifySessionSuccess {
  valid: true;
  user: AuthUser;
}

export interface VerifySessionFailure {
  valid: false;
  code: AuthErrorCode;
  message?: string;
}

export type VerifySessionResult =
  | VerifySessionSuccess
  | VerifySessionFailure;

export const AUTH_STORAGE_KEYS = {
  accessToken: "token",
  user: "user",
  legacyAccessTokens: ["authToken", "jwt", "accessToken"],
  legacyRole: "role",
  legacyIsAdmin: "isAdmin",
} as const;
