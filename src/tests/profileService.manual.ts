import assert from "node:assert/strict";
import { isProfileMockMode, updateProfile } from "../features/profile/services/profileApi";
import type { AuthUser } from "../features/auth/types";

const user: AuthUser = { id: "mock-customer-001", name: "Demo Customer", email: "demo.customer@example.com", role: "user" };

assert.equal(isProfileMockMode("true"), true);
assert.equal(isProfileMockMode("false"), false);

const success = await updateProfile(user, "redacted-token", { name: "Updated Demo", email: "updated@example.com" }, { mockMode: true });
assert.equal(success.success, true);
if (success.success) {
  assert.equal(success.user.name, "Updated Demo");
  assert.equal(success.user.email, "updated@example.com");
  assert.equal(success.mock, true);
}

const conflict = await updateProfile(user, "redacted-token", { name: "Demo Customer", email: "existing.customer@example.com" }, { mockMode: true });
assert.equal(conflict.success, false);
if (!conflict.success) assert.equal(conflict.code, "EMAIL_CONFLICT");

const unauthorized = await updateProfile(user, "redacted-token", { name: "Demo Customer", email: "expired.session@example.com" }, { mockMode: true });
assert.equal(unauthorized.success, false);
if (!unauthorized.success) assert.equal(unauthorized.code, "UNAUTHORIZED");

console.log(JSON.stringify({ suite: "profileService", passed: 10, failed: 0, syntheticDataUsed: true, tokenLogged: false }, null, 2));
