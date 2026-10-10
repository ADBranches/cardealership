import assert from "node:assert/strict";
import { hasProfileValidationErrors, validateProfile } from "../features/profile/utils/profileValidation";

assert.equal(validateProfile({ name: "", email: "user@example.com" }).name, "Display name is required.");
assert.equal(validateProfile({ name: "A", email: "user@example.com" }).name, "Display name must contain at least 2 characters.");
assert.equal(validateProfile({ name: "Demo User", email: "invalid" }).email, "Enter a valid email address.");
assert.equal(hasProfileValidationErrors(validateProfile({ name: "Demo User", email: "demo@example.com" })), false);

console.log(JSON.stringify({ suite: "profileValidation", passed: 4, failed: 0 }, null, 2));
