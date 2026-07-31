import assert from "node:assert/strict";
import { clearStoredSession, getStoredSession, saveSession, type AuthStorage } from "../features/auth/services/authStorage";

class MemoryStorage implements AuthStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

const storage = new MemoryStorage();
assert.equal(getStoredSession(storage), null, "Missing token must return no session");

const session = { accessToken: "test-token-value", user: { id: "7", email: "user@example.com", role: "user" } };
saveSession(session, storage);
assert.deepEqual(getStoredSession(storage), session, "Saved session must be readable");
assert.equal(storage.getItem("token"), session.accessToken, "Canonical token key must be written");
assert.equal(JSON.parse(storage.getItem("user") ?? "{}").email, session.user.email, "Canonical user key must be written");

storage.setItem("authToken", "legacy-token");
storage.setItem("jwt", "legacy-jwt");
storage.setItem("accessToken", "legacy-access-token");
storage.setItem("role", "admin");
storage.setItem("isAdmin", "true");
clearStoredSession(storage);
for (const key of ["token", "user", "authToken", "jwt", "accessToken", "role", "isAdmin"]) assert.equal(storage.getItem(key), null, `${key} must be removed`);

console.log(JSON.stringify({ suite: "authStorage", passed: 4, failed: 0, tokenLogged: false }, null, 2));
