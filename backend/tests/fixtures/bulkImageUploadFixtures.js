"use strict";

const createImageFile = (clientFileId, overrides = {}) => Object.freeze({
  clientFileId,
  originalname: `${clientFileId}.jpg`,
  mimetype: "image/jpeg",
  size: 1024,
  buffer: Buffer.from(clientFileId),
  ...overrides
});

const bulkUploadMatrix = Object.freeze([
  Object.freeze({
    name: "all files upload successfully",
    vehicleExists: true,
    files: Object.freeze([
      createImageFile("file-001"),
      createImageFile("file-002")
    ]),
    storageFailureIds: Object.freeze([]),
    persistenceFailureIds: Object.freeze([]),
    expectedStatuses: Object.freeze(["uploaded", "uploaded"]),
    expectedUploaded: 2,
    expectedRejected: 0,
    expectedFailed: 0
  }),
  Object.freeze({
    name: "rejected file preserves successful results",
    vehicleExists: true,
    files: Object.freeze([
      createImageFile("file-001"),
      createImageFile("file-002", {
        validationError: Object.freeze({
          code: "UNSUPPORTED_MIME_TYPE",
          message: "Unsupported image type."
        })
      }),
      createImageFile("file-003")
    ]),
    storageFailureIds: Object.freeze([]),
    persistenceFailureIds: Object.freeze([]),
    expectedStatuses: Object.freeze(["uploaded", "rejected", "uploaded"]),
    expectedUploaded: 2,
    expectedRejected: 1,
    expectedFailed: 0
  }),
  Object.freeze({
    name: "storage failure remains file-scoped",
    vehicleExists: true,
    files: Object.freeze([
      createImageFile("file-001"),
      createImageFile("file-002"),
      createImageFile("file-003")
    ]),
    storageFailureIds: Object.freeze(["file-002"]),
    persistenceFailureIds: Object.freeze([]),
    expectedStatuses: Object.freeze(["uploaded", "failed", "uploaded"]),
    expectedUploaded: 2,
    expectedRejected: 0,
    expectedFailed: 1
  }),
  Object.freeze({
    name: "persistence failure cleans orphan and continues",
    vehicleExists: true,
    files: Object.freeze([
      createImageFile("file-001"),
      createImageFile("file-002")
    ]),
    storageFailureIds: Object.freeze([]),
    persistenceFailureIds: Object.freeze(["file-001"]),
    expectedStatuses: Object.freeze(["failed", "uploaded"]),
    expectedUploaded: 1,
    expectedRejected: 0,
    expectedFailed: 1,
    expectedCleanupIds: Object.freeze(["file-001"])
  }),
  Object.freeze({
    name: "missing vehicle prevents storage",
    vehicleExists: false,
    files: Object.freeze([createImageFile("file-001")]),
    storageFailureIds: Object.freeze([]),
    persistenceFailureIds: Object.freeze([]),
    expectedErrorCode: "CAR_NOT_FOUND",
    expectedStorageCalls: 0
  })
]);

module.exports = Object.freeze({
  createImageFile,
  bulkUploadMatrix
});
