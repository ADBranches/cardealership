import type { LoginCredentials, RegisterCredentials } from "../types";

const TOKEN_KEYS = ["token", "authToken", "jwt"] as const;

export function getAuthToken(): string | null {
  for (const key of TOKEN_KEYS) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }
  return null;
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}

export function clearAuthToken(): void {
  TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
}

export async function login(credentials: LoginCredentials): Promise<{ success: boolean; message: string }> {
  console.log("Login attempt:", credentials.email);
  return {
    success: false,
    message: "Authentication endpoint connection pending.",
  };
}

export async function register(
  credentials: RegisterCredentials
): Promise<{ success: boolean; message: string }> {
  console.log("Register attempt:", credentials.email);
  return {
    success: false,
    message: "Registration endpoint connection pending.",
  };
}
