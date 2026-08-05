export type PublicEnvironment = {
  readonly VITE_API_BASE_URL?: string;
  readonly MODE?: string;
  readonly PROD?: boolean;
};

export function normalizeApiBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

export function resolveApiBaseUrl(environment: PublicEnvironment): string {
  const apiBaseUrl = normalizeApiBaseUrl(environment.VITE_API_BASE_URL ?? "");
  const mode = environment.MODE ?? (environment.PROD ? "production" : "development");

  if (!apiBaseUrl) {
    throw new Error(`VITE_API_BASE_URL is required for ${mode} builds.`);
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(apiBaseUrl);
  } catch {
    throw new Error("VITE_API_BASE_URL must be an absolute HTTP or HTTPS URL.");
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("VITE_API_BASE_URL must be an absolute HTTP or HTTPS URL.");
  }

  return apiBaseUrl;
}

export function getApiBaseUrl(environment: PublicEnvironment = import.meta.env): string {
  return resolveApiBaseUrl(environment);
}
