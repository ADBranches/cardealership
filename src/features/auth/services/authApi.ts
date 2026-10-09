import type { AuthErrorCode, AuthUser, VerifySessionResult } from "../types";
import { buildApiUrl } from "../../../api/client";

export const AUTH_ENDPOINTS = {
  register: "/api/auth/register",
  login: "/api/auth/login",
  session: "/api/auth/session",
  logout: "/api/auth/logout",
  verifyEmail: "/api/auth/verify-email",
  resendVerification: "/api/auth/resend-verification",
  forgotPassword: "/api/auth/forgot-password",
  resetPassword: "/api/auth/reset-password",
} as const;
export const AUTH_SESSION_VERIFICATION_ENDPOINT = AUTH_ENDPOINTS.session;

type FetchLike = typeof fetch;
type VerifySessionOptions = { endpoint?: string; fetcher?: FetchLike; };

type ApiErrorBody = { message?: string; error?: { code?: AuthErrorCode; message?: string } };
function normalizeFailure(status: number, body: ApiErrorBody): VerifySessionResult {
  const sourceMessage = body.error?.message ?? body.message ?? "";
  const normalizedMessage = sourceMessage.toLowerCase();
  let code: AuthErrorCode = body.error?.code ?? "SESSION_VERIFICATION_FAILED";
  if (status === 401 && !body.error?.code) code = normalizedMessage.includes("expired") ? "TOKEN_EXPIRED" : normalizedMessage.includes("invalid") ? "INVALID_TOKEN" : "UNAUTHORIZED";
  return { valid: false, code, message: "Your session could not be verified. Please sign in again." };
}

export function createAuthorizationHeaders(token: string): HeadersInit { return { Authorization: `Bearer ${token}`, Accept: "application/json" }; }
export async function verifySession(token: string, options: VerifySessionOptions = {}): Promise<VerifySessionResult> {
  const fetcher = options.fetcher ?? fetch;
  const endpoint = options.endpoint ?? AUTH_SESSION_VERIFICATION_ENDPOINT;
  const requestUrl = options.fetcher ? endpoint : buildApiUrl(endpoint);
  try {
    const response = await fetcher(requestUrl, { method: "GET", headers: createAuthorizationHeaders(token) });
    const data = (await response.json().catch(() => ({}))) as ApiErrorBody & { valid?: boolean; user?: AuthUser };
    if (response.ok && data.user) return { valid: true, user: { ...data.user, id: String(data.user.id), role: data.user.role ?? "user" } };
    return normalizeFailure(response.status, data);
  } catch {
    return { valid: false, code: "SESSION_VERIFICATION_FAILED", message: "Session verification is temporarily unavailable." };
  }
}
