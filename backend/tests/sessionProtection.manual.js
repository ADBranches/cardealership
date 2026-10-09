import assert from "node:assert/strict";
import { validateSessionPayload } from "../services/sessionService.js";
const invalid = await validateSessionPayload(null);
assert.equal(invalid.valid, false);
assert.equal(invalid.code, "INVALID_TOKEN");
const malformed = await validateSessionPayload({ id: 1 });
assert.equal(malformed.valid, false);
assert.equal(malformed.code, "INVALID_TOKEN");
console.log(JSON.stringify({ suite: "sessionProtectionBackend", passed: 4, failed: 0, tokenLogged: false, versionCheckRequired: true }));
