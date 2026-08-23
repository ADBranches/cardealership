export type PublicEnvironment = {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_CHAT_GATEWAY_URL?: string;
  readonly VITE_CHAT_TRANSPORT?: string;
  readonly VITE_CHAT_MOCK_MODE?: string;
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

export type ChatTransportMode = "mock" | "native-websocket" | "socket.io";

export type PublicChatEnvironment = PublicEnvironment & {
  readonly VITE_CHAT_GATEWAY_URL?: string;
  readonly VITE_CHAT_TRANSPORT?: string;
  readonly VITE_CHAT_MOCK_MODE?: string;
};

export type ChatEnvironmentConfiguration = {
  gatewayUrl: string;
  transport: ChatTransportMode;
  mockMode: boolean;
};

export function resolveBooleanEnvironmentValue(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

export function resolveChatEnvironment(
  environment: PublicChatEnvironment,
): ChatEnvironmentConfiguration {
  const requestedTransport = environment.VITE_CHAT_TRANSPORT?.trim() || "mock";
  const mockMode = resolveBooleanEnvironmentValue(
    environment.VITE_CHAT_MOCK_MODE,
  );

  if (
    requestedTransport !== "mock" &&
    requestedTransport !== "native-websocket" &&
    requestedTransport !== "socket.io"
  ) {
    throw new Error("VITE_CHAT_TRANSPORT must be mock, native-websocket, or socket.io.");
  }

  const gatewayUrl = environment.VITE_CHAT_GATEWAY_URL?.trim() || "mock://admin-chat";

  if (requestedTransport !== "mock" && !mockMode) {
    throw new Error(
      "Live chat transport is unavailable until the backend protocol is confirmed.",
    );
  }

  return {
    gatewayUrl,
    transport: requestedTransport,
    mockMode,
  };
}

export function getChatEnvironment(
  environment: PublicChatEnvironment = import.meta.env,
): ChatEnvironmentConfiguration {
  return resolveChatEnvironment(environment);
}
