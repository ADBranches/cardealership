"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const configuration = require("../../../config");
const { createImageUploadValidator, sanitizeImageFilename } = require("../../../utils/validateImageUpload");

const validateImageUpload = createImageUploadValidator(configuration.bulkImageUpload);

test("allowed image passes validation", () => {
  const result = validateImageUpload({ originalname: "front-view.jpg", mimetype: "image/jpeg", size: 1024 });
  assert.equal(result.originalname, "front-view.jpg");
  assert.equal(Object.isFrozen(result), true);
});

test("unsupported MIME type fails predictably", () => {
  assert.throws(() => validateImageUpload({ originalname: "document.jpg", mimetype: "application/pdf", size: 1024 }), (error) => error.code === "UNSUPPORTED_MIME_TYPE");
});

test("unsupported extension fails predictably", () => {
  assert.throws(() => validateImageUpload({ originalname: "vehicle.gif", mimetype: "image/jpeg", size: 1024 }), (error) => error.code === "UNSUPPORTED_EXTENSION");
});

test("oversized image fails predictably", () => {
  assert.throws(() => validateImageUpload({ originalname: "vehicle.jpg", mimetype: "image/jpeg", size: configuration.bulkImageUpload.maxFileSizeBytes + 1 }), (error) => error.code === "FILE_TOO_LARGE");
});

test("filename sanitization removes unsafe path input", () => {
  assert.equal(sanitizeImageFilename("../../unsafe vehicle.jpg"), "unsafe_vehicle.jpg");
  assert.equal(sanitizeImageFilename("..\\unsafe.png"), "unsafe.png");
});
