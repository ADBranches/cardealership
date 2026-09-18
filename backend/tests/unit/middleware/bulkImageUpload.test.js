"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { mapMulterError, multipartParser } = require("../../../middleware/bulkImageUpload");

test("file-size parser error maps predictably", () => {
  assert.deepEqual(mapMulterError({ code: "LIMIT_FILE_SIZE" }), { code: "FILE_TOO_LARGE", message: "An image exceeds the permitted size limit." });
});

test("file-count parser error maps predictably", () => {
  assert.deepEqual(mapMulterError({ code: "LIMIT_FILE_COUNT" }), { code: "TOO_MANY_FILES", message: "Too many image files were submitted." });
});

test("unexpected multipart field maps predictably", () => {
  assert.deepEqual(mapMulterError({ code: "LIMIT_UNEXPECTED_FILE" }), { code: "UNEXPECTED_FIELD", message: "The multipart field name is not permitted." });
});

test("multipart parser is configured as middleware", () => {
  assert.equal(typeof multipartParser, "function");
});
