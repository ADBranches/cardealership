/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_PROFILE_MOCK_MODE?: string;
  readonly VITE_AVAILABILITY_MOCK_MODE?: string;
  readonly VITE_CHAT_GATEWAY_URL?: string;
  readonly VITE_CHAT_TRANSPORT?: "mock" | "native-websocket" | "socket.io";
  readonly VITE_CHAT_MOCK_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
