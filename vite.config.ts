import { defineConfig, loadEnv } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), "VITE_");
  const apiBaseUrl = environment.VITE_API_BASE_URL?.trim().replace(/\/+$/, "");

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

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    assetsInclude: ["**/*.svg", "**/*.csv"],
    build: {
      manifest: true,
      minify: "esbuild",
      sourcemap: false,
      chunkSizeWarningLimit: 500,
    },
  };
});
