import assert from "node:assert/strict";
import { verifySession } from "../features/auth/services/authApi";

const token = "sensitive-test-token";
let receivedAuthorization = "";
const successFetcher: typeof fetch = async (_input, init) => {
  const headers = init?.headers as Record<string, string>;
  receivedAuthorization = headers.Authorization;
  return new Response(JSON.stringify({ user: { id: 9, email: "verified@example.com", role: "admin" } }), { status: 200, headers: { "Content-Type": "application/json" } });
};
const success = await verifySession(token, { fetcher: successFetcher });
assert.equal(receivedAuthorization, `Bearer ${token}`, "Verification must attach the bearer token");
assert.equal(success.valid, true, "Successful verification must return a valid session");
if (success.valid) assert.equal(success.user.id, "9", "User ID must be normalized to string");

const unauthorized = await verifySession(token, { fetcher: async () => new Response(JSON.stringify({ message: "Invalid token" }), { status: 401 }) });
assert.deepEqual(unauthorized, { valid: false, code: "INVALID_TOKEN", message: "Your session could not be verified. Please sign in again." });

const networkFailure = await verifySession(token, { fetcher: async () => { throw new Error(`Network error for ${token}`); } });
assert.deepEqual(networkFailure, { valid: false, code: "SESSION_VERIFICATION_FAILED", message: "Session verification is temporarily unavailable." });
assert.equal(JSON.stringify(unauthorized).includes(token), false, "Unauthorized result must not expose the token");
assert.equal(JSON.stringify(networkFailure).includes(token), false, "Network failure must not expose the token");

console.log(JSON.stringify({ suite: "authService", passed: 6, failed: 0, tokenLogged: false }, null, 2));
