import { getApiBaseUrl } from "../config/env";

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}

export function createBearerHeaders(token: string, headers: HeadersInit = {}): Headers {
  const result = new Headers(headers);
  result.set("Authorization", `Bearer ${token}`);
  result.set("Accept", "application/json");
  return result;
}

export async function apiRequest(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(buildApiUrl(path), options);
}

export async function authenticatedApiRequest(path: string, token: string, options: RequestInit = {}): Promise<Response> {
  return apiRequest(path, { ...options, headers: createBearerHeaders(token, options.headers) });
}
