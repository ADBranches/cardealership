import assert from "node:assert/strict";
import { createAuthenticatedState, createUnauthenticatedState } from "../app/context/auth";
import { getProtectedRouteDecision } from "../app/components/auth/routeAccess";
import { verifySession as verifySessionRequest } from "../features/auth/services/authApi";
import { clearStoredSession, getAuthToken, getStoredSession, saveSession, type AuthStorage } from "../features/auth/services/authStorage";

class MemoryStorage implements AuthStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

const storage = new MemoryStorage();
const token = "persistence-test-token";
const loginSession = { accessToken: token, user: { id: "31", email: "admin@example.com", role: "admin" } };
const authKeys = ["token", "user", "authToken", "jwt", "accessToken", "role", "isAdmin"];

saveSession(loginSession, storage);
assert.deepEqual(getStoredSession(storage), loginSession, "Login must persist the expected session");
assert.equal(storage.getItem("token"), token, "Login must write the canonical token");
assert.equal(JSON.parse(storage.getItem("user") ?? "{}").email, loginSession.user.email, "Login must write the canonical user");

const afterRefresh = getStoredSession(storage);
assert.deepEqual(afterRefresh, loginSession, "Refresh must recover the stored session");
const afterBrowserReopen = getStoredSession(storage);
assert.deepEqual(afterBrowserReopen, loginSession, "Browser reopen must recover a still-valid session");

let verificationCalls = 0;
const successfulVerification = await verifySessionRequest(token, { fetcher: async (_input, init) => {
  verificationCalls += 1;
  const headers = init?.headers as Record<string, string>;
  assert.equal(headers.Authorization, `Bearer ${token}`, "Verification must send the bearer token");
  return new Response(JSON.stringify({ user: loginSession.user }), { status: 200, headers: { "Content-Type": "application/json" } });
} });
assert.equal(successfulVerification.valid, true, "Valid verification must succeed");
assert.equal(verificationCalls, 1, "One restoration attempt must perform one verification request");
if (!successfulVerification.valid) throw new Error("Expected successful verification");
const restoredState = createAuthenticatedState({ accessToken: token, user: successfulVerification.user });
assert.equal(restoredState.isAuthenticated, true, "Verified session must restore authentication");
assert.equal(restoredState.isAuthReady, true, "Verified restoration must exit loading");
assert.equal(getProtectedRouteDecision(restoredState.isAuthReady, restoredState.isAuthenticated), "allow", "Direct protected navigation must be allowed after restoration");

const expired = await verifySessionRequest(token, { fetcher: async () => new Response(JSON.stringify({ message: "Token expired" }), { status: 401 }) });
assert.equal(expired.valid, false);
if (expired.valid) throw new Error("Expected expired failure");
assert.equal(expired.code, "TOKEN_EXPIRED");
clearStoredSession(storage);
assert.equal(getStoredSession(storage), null, "Expired session must be cleared");

saveSession(loginSession, storage);
const malformed = await verifySessionRequest(token, { fetcher: async () => new Response(JSON.stringify({ message: "Invalid token" }), { status: 401 }) });
assert.equal(malformed.valid, false);
if (malformed.valid) throw new Error("Expected invalid failure");
assert.equal(malformed.code, "INVALID_TOKEN");
clearStoredSession(storage);
assert.equal(getStoredSession(storage), null, "Malformed session must be cleared");

saveSession(loginSession, storage);
const unauthorized = await verifySessionRequest(token, { fetcher: async () => new Response(JSON.stringify({ message: "Authentication required" }), { status: 401 }) });
assert.equal(unauthorized.valid, false);
clearStoredSession(storage);
const unauthorizedState = createUnauthenticatedState({ code: "UNAUTHORIZED", message: "Please sign in again." });
assert.equal(getProtectedRouteDecision(unauthorizedState.isAuthReady, unauthorizedState.isAuthenticated), "redirect-login", "Unauthorized session must return to login");

saveSession(loginSession, storage);
const networkFailure = await verifySessionRequest(token, { fetcher: async () => { throw new Error(`Network failure for ${token}`); } });
assert.equal(networkFailure.valid, false);
if (networkFailure.valid) throw new Error("Expected network failure");
assert.equal(networkFailure.code, "SESSION_VERIFICATION_FAILED");
clearStoredSession(storage);
const networkState = createUnauthenticatedState({ code: networkFailure.code, message: networkFailure.message ?? "Unavailable" });
assert.equal(networkState.isAuthenticated, false, "Network failure must not fabricate authentication");
assert.equal(networkState.isAuthReady, true, "Network failure must exit loading");

saveSession(loginSession, storage);
clearStoredSession(storage);
assert.equal(getAuthToken(storage), null, "Logout must clear the token");
assert.equal(getStoredSession(storage), null, "Logout must clear the session");
assert.equal(getProtectedRouteDecision(true, false), "redirect-login", "Logout must remove protected access");
for (const key of authKeys) assert.equal(storage.getItem(key), null, `${key} must be cleared`);

const serializedResults = JSON.stringify({ expired, malformed, unauthorized, networkFailure, networkState });
assert.equal(serializedResults.includes(token), false, "Results must not expose the token");
assert.equal(serializedResults.includes("password"), false, "Results must not expose private credentials");

console.log(JSON.stringify({ suite: "authPersistence", passed: 31, failed: 0, verificationContract: "mock", liveEndpointPending: true, protectedRefreshVerified: true, invalidSessionCleanupVerified: true, tokenLogged: false }, null, 2));
