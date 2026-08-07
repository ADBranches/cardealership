import type { AuthSession, LoginCredentials, RegisterCredentials, VerifySessionResult } from "../types";
import { clearStoredSession, getAuthToken, getAuthenticatedUser, getStoredSession, saveSession } from "./authStorage";
import { verifySession as verifySessionRequest } from "./authApi";

export { clearStoredSession, getAuthenticatedUser, getAuthToken, getStoredSession, saveSession };

export function isAuthenticated(): boolean {
  return Boolean(getStoredSession());
}

export function clearAuthToken(): void {
  clearStoredSession();
}

export async function verifySession(token: string, options: Parameters<typeof verifySessionRequest>[1] = {}): Promise<VerifySessionResult> {
  const result = await verifySessionRequest(token, options);
  if (!result.valid) clearStoredSession();
  return result;
}

export async function restoreStoredSession(options: Parameters<typeof verifySessionRequest>[1] = {}): Promise<AuthSession | null> {
  const token = getAuthToken();
  if (!token) return null;
  const result = await verifySession(token, options);
  if (!result.valid) return null;
  const session = { accessToken: token, user: result.user };
  saveSession(session);
  return session;
}

export async function login(credentials: LoginCredentials): Promise<{ success: boolean; message: string }> {
  void credentials;
  return { success: false, message: "Authentication endpoint connection pending." };
}

export async function register(credentials: RegisterCredentials): Promise<{ success: boolean; message: string }> {
  void credentials;
  return { success: false, message: "Registration endpoint connection pending." };
}
