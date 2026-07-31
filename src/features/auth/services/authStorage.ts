import { AUTH_STORAGE_KEYS, type AuthSession, type AuthUser } from "../types";

export interface AuthStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function getDefaultStorage(): AuthStorage | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  return window.localStorage;
}

function parseStoredUser(value: string | null): AuthUser | null {
  if (!value) return null;
  try {
    const user = JSON.parse(value) as AuthUser;
    return user && typeof user.id !== "undefined" && typeof user.email === "string" ? { ...user, id: String(user.id) } : null;
  } catch {
    return null;
  }
}

export function getAuthToken(storage: AuthStorage | null = getDefaultStorage()): string | null {
  if (!storage) return null;
  const canonicalToken = storage.getItem(AUTH_STORAGE_KEYS.accessToken);
  if (canonicalToken) return canonicalToken;
  for (const key of AUTH_STORAGE_KEYS.legacyAccessTokens) {
    const legacyToken = storage.getItem(key);
    if (legacyToken) return legacyToken;
  }
  return null;
}

export function getAuthenticatedUser(storage: AuthStorage | null = getDefaultStorage()): AuthUser | null {
  if (!storage) return null;
  return parseStoredUser(storage.getItem(AUTH_STORAGE_KEYS.user));
}

export function getStoredSession(storage: AuthStorage | null = getDefaultStorage()): AuthSession | null {
  if (!storage) return null;
  const accessToken = getAuthToken(storage);
  const user = getAuthenticatedUser(storage);
  if (!accessToken || !user) return null;
  if (!storage.getItem(AUTH_STORAGE_KEYS.accessToken)) storage.setItem(AUTH_STORAGE_KEYS.accessToken, accessToken);
  return { accessToken, user };
}

export function saveSession(session: AuthSession, storage: AuthStorage | null = getDefaultStorage()): void {
  if (!storage) return;
  storage.setItem(AUTH_STORAGE_KEYS.accessToken, session.accessToken);
  storage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(session.user));
}

export function clearStoredSession(storage: AuthStorage | null = getDefaultStorage()): void {
  if (!storage) return;
  storage.removeItem(AUTH_STORAGE_KEYS.accessToken);
  storage.removeItem(AUTH_STORAGE_KEYS.user);
  AUTH_STORAGE_KEYS.legacyAccessTokens.forEach((key) => storage.removeItem(key));
  storage.removeItem(AUTH_STORAGE_KEYS.legacyRole);
  storage.removeItem(AUTH_STORAGE_KEYS.legacyIsAdmin);
}
