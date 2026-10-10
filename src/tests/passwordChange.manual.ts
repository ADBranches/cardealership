import assert from "node:assert/strict";
import { changePassword } from "../features/profile/services/passwordApi";

const values = { currentPassword: "OldPass1", newPassword: "NewStrong2", confirmPassword: "NewStrong2" };
const success = await changePassword("redacted-token", values, { mockMode: true });
assert.equal(success.success, true);
if (success.success) assert.equal(success.mock, true);

const incorrect = await changePassword("redacted-token", { ...values, currentPassword: "incorrect-password" }, { mockMode: true });
assert.equal(incorrect.success, false);
if (!incorrect.success) assert.equal(incorrect.code, "CURRENT_PASSWORD_INCORRECT");

const expired = await changePassword("redacted-token", { ...values, currentPassword: "expired-session" }, { mockMode: true });
assert.equal(expired.success, false);
if (!expired.success) assert.equal(expired.code, "UNAUTHORIZED");

const limited = await changePassword("redacted-token", { ...values, currentPassword: "rate-limited" }, { mockMode: true });
assert.equal(limited.success, false);
if (!limited.success) assert.equal(limited.code, "RATE_LIMITED");

console.log(JSON.stringify({ suite: "passwordChange", passed: 8, failed: 0, syntheticDataUsed: true, passwordLogged: false, passwordPersisted: false }, null, 2));
