import type {
  AuthSession,
  LoginCredentials,
  RegisterCredentials,
  VerifySessionResult,
} from "../types";
import {
  clearStoredSession,
  getAuthToken,
  getAuthenticatedUser,
  getStoredSession,
  saveSession,
} from "./authStorage";
import { verifySession as verifySessionRequest } from "./authApi";
import { buildApiUrl } from "../../../api/client";

export {
  clearStoredSession,
  getAuthenticatedUser,
  getAuthToken,
  getStoredSession,
  saveSession,
};

export function isAuthenticated(): boolean {
  return Boolean(getStoredSession());
}

export function clearAuthToken(): void {
  clearStoredSession();
}

export async function verifySession(
  token: string,
  options: Parameters<typeof verifySessionRequest>[1] = {},
): Promise<VerifySessionResult> {
  const result = await verifySessionRequest(token, options);

  if (!result.valid) {
    clearStoredSession();
  }

  return result;
}

export async function restoreStoredSession(
  options: Parameters<typeof verifySessionRequest>[1] = {},
): Promise<AuthSession | null> {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  const result = await verifySession(token, options);

  if (!result.valid) {
    return null;
  }

  const session = {
    accessToken: token,
    user: result.user,
  };

  saveSession(session);

  return session;
}

type LoginApiResponse = {
  success?: boolean;
  message?: string;
  token?: string;
  user?: {
    id?: number | string;
    name?: string;
    email?: string;
    role?: string;
  };
};

export async function login(
  credentials: LoginCredentials,
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(buildApiUrl("/api/auth/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: credentials.email.trim(),
        password: credentials.password,
      }),
    });

    const data = (await response.json().catch(() => ({}))) as LoginApiResponse;

    if (!response.ok || data.success !== true) {
      return {
        success: false,
        message: data.message ?? "Unable to sign in.",
      };
    }

    if (!data.token || !data.user) {
      return {
        success: false,
        message:
          "Login succeeded, but the server returned an incomplete session.",
      };
    }

    if (data.user.id === undefined || !data.user.email || !data.user.role) {
      return {
        success: false,
        message:
          "Login succeeded, but the server returned incomplete user information.",
      };
    }

    const session: AuthSession = {
      accessToken: data.token,
      user: {
        id: String(data.user.id),
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        isAdmin: data.user.role === "admin",
      },
    };

    saveSession(session);

    return {
      success: true,
      message: data.message ?? "Login successful.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to connect to the authentication server.",
    };
  }
}

export async function register(
  credentials: RegisterCredentials,
): Promise<{ success: boolean; message: string }> {
  void credentials;

  return {
    success: false,
    message: "Registration endpoint connection pending.",
  };
}
