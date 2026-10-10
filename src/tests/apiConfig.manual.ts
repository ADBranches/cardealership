import assert from "node:assert/strict";
import { getApiBaseUrl, normalizeApiBaseUrl, resolveApiBaseUrl } from "../config/env";

assert.equal(normalizeApiBaseUrl("https://api.example.com///"), "https://api.example.com");
assert.equal(resolveApiBaseUrl({ VITE_API_BASE_URL: "https://api.example.com/", MODE: "production" }), "https://api.example.com");
assert.equal(resolveApiBaseUrl({ VITE_API_BASE_URL: "http://localhost:5000", MODE: "development" }), "http://localhost:5000");
assert.equal(getApiBaseUrl({ VITE_API_BASE_URL: "https://api.example.com", PROD: true }), "https://api.example.com");
assert.throws(() => resolveApiBaseUrl({ MODE: "production", PROD: true }), /VITE_API_BASE_URL is required for production builds/);
assert.throws(() => resolveApiBaseUrl({ VITE_API_BASE_URL: "not-a-url", MODE: "production" }), /absolute HTTP or HTTPS URL/);
assert.throws(() => resolveApiBaseUrl({ VITE_API_BASE_URL: "file:\/\/local", MODE: "production" }), /absolute HTTP or HTTPS URL/);

console.log(JSON.stringify({ suite: "apiConfig", passed: 7, failed: 0, trailingSlashNormalized: true, missingProductionValueRejected: true, invalidProtocolRejected: true, privateSecretsReferenced: false }, null, 2));
