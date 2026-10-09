import { clearStoredSession } from "./authStorage";

const UNAUTHORIZED_CODES = new Set(["AUTHENTICATION_REQUIRED", "UNAUTHORIZED", "INVALID_TOKEN", "TOKEN_EXPIRED", "SESSION_REVOKED"]);

export function isUnauthorizedSession(status: number, code?: string): boolean {
  return status === 401 || Boolean(code && UNAUTHORIZED_CODES.has(code));
}

export function clearUnauthorizedSession(status: number, code?: string): boolean {
  if (!isUnauthorizedSession(status, code)) return false;
  clearStoredSession();
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("auth:session-invalid"));
  return true;
}

export async function guardUnauthorizedResponse(response: Response): Promise<Response> {
  if (response.status !== 401) return response;
  let code: string | undefined;
  try { code = (await response.clone().json())?.error?.code; } catch { code = undefined; }
  clearUnauthorizedSession(response.status, code);
  return response;
}
