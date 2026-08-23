import assert from "node:assert/strict";
import { hasPasswordValidationErrors, validatePasswordChange } from "../features/profile/utils/passwordValidation";

assert.equal(validatePasswordChange({ currentPassword: "", newPassword: "StrongPass1", confirmPassword: "StrongPass1" }).currentPassword, "Current password is required.");
assert.equal(validatePasswordChange({ currentPassword: "OldPass1", newPassword: "short", confirmPassword: "short" }).newPassword, "New password must contain at least 8 characters.");
assert.equal(validatePasswordChange({ currentPassword: "OldPass1", newPassword: "StrongPass1", confirmPassword: "Different1" }).confirmPassword, "Password confirmation does not match.");
assert.equal(validatePasswordChange({ currentPassword: "StrongPass1", newPassword: "StrongPass1", confirmPassword: "StrongPass1" }).newPassword, "New password must differ from the current password.");
assert.equal(hasPasswordValidationErrors(validatePasswordChange({ currentPassword: "OldPass1", newPassword: "NewStrong2", confirmPassword: "NewStrong2" })), false);

console.log(JSON.stringify({ suite: "passwordValidation", passed: 5, failed: 0 }, null, 2));
