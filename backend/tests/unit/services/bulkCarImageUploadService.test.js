"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createBulkCarImageUploadService } = require("../../../services/bulkCarImageUploadService");

const createFile = (clientFileId, fileName = "vehicle.jpg") => ({
  clientFileId,
  originalname: fileName,
  mimetype: "image/jpeg",
  size: 1024,
  buffer: Buffer.from(clientFileId)
});

const createDependencies = (overrides = {}) => {
  const activity = {
    stored: [],
    removed: [],
    persisted: [],
    vehicleLookups: []
  };

  const dependencies = {
    vehicleRepository: {
      findById: async (vehicleId) => {
        activity.vehicleLookups.push(vehicleId);
        return { id: vehicleId };
      }
    },
    imageStorage: {
      store: async (file) => {
        activity.stored.push(file.clientFileId);
        return {
          storageKey: `cars/${file.vehicleId}/${file.clientFileId}`,
          url: `/uploads/cars/${file.vehicleId}/${file.fileName}`
        };
      },
      remove: async (storageKey) => {
        activity.removed.push(storageKey);
      }
    },
    imageRepository: {
      save: async (metadata) => {
        activity.persisted.push(metadata.clientFileId);
        return {
          id: `image-${metadata.clientFileId}`,
          url: metadata.url
        };
      }
    }
  };

  return {
    activity,
    dependencies: {
      vehicleRepository: overrides.vehicleRepository || dependencies.vehicleRepository,
      imageStorage: overrides.imageStorage || dependencies.imageStorage,
      imageRepository: overrides.imageRepository || dependencies.imageRepository
    }
  };
};

test("each accepted file receives a stable uploaded result", async () => {
  const { dependencies } = createDependencies();
  const service = createBulkCarImageUploadService(dependencies);
  const response = await service.processBulkUpload({
    vehicleId: "car-123",
    files: [createFile("file-001"), createFile("file-002", "rear.jpg")]
  });

  assert.equal(response.carId, "car-123");
  assert.equal(response.summary.received, 2);
  assert.equal(response.summary.uploaded, 2);
  assert.equal(response.files[0].clientFileId, "file-001");
  assert.equal(response.files[1].clientFileId, "file-002");
  assert.equal(response.files[0].status, "uploaded");
  assert.equal(Object.isFrozen(response), true);
});

test("one rejected file does not erase successful results", async () => {
  const { dependencies, activity } = createDependencies();
  const service = createBulkCarImageUploadService(dependencies);
  const rejectedFile = {
    ...createFile("file-002", "document.pdf"),
    validationError: {
      code: "UNSUPPORTED_MIME_TYPE",
      message: "The image MIME type is not supported."
    }
  };

  const response = await service.processBulkUpload({
    vehicleId: "car-123",
    files: [createFile("file-001"), rejectedFile, createFile("file-003")]
  });

  assert.deepEqual(response.files.map((result) => result.clientFileId), ["file-001", "file-002", "file-003"]);
  assert.deepEqual(response.files.map((result) => result.status), ["uploaded", "rejected", "uploaded"]);
  assert.equal(response.summary.uploaded, 2);
  assert.equal(response.summary.rejected, 1);
  assert.deepEqual(activity.stored, ["file-001", "file-003"]);
});

test("vehicle-not-found is handled before permanent storage", async () => {
  let storageCalls = 0;
  const { dependencies } = createDependencies({
    vehicleRepository: { findById: async () => null },
    imageStorage: {
      store: async () => {
        storageCalls += 1;
      },
      remove: async () => undefined
    }
  });
  const service = createBulkCarImageUploadService(dependencies);

  await assert.rejects(
    service.processBulkUpload({ vehicleId: "missing-car", files: [createFile("file-001")] }),
    (error) => error.code === "CAR_NOT_FOUND"
  );
  assert.equal(storageCalls, 0);
});

test("storage failure produces a controlled file result", async () => {
  const { dependencies } = createDependencies({
    imageStorage: {
      store: async () => {
        throw new Error("Storage unavailable");
      },
      remove: async () => undefined
    }
  });
  const service = createBulkCarImageUploadService(dependencies);
  const response = await service.processBulkUpload({
    vehicleId: "car-123",
    files: [createFile("file-001")]
  });

  assert.equal(response.files[0].status, "failed");
  assert.equal(response.files[0].error.code, "STORAGE_FAILED");
  assert.equal(response.summary.failed, 1);
});

test("database failure removes the orphaned storage object", async () => {
  const removedStorageKeys = [];
  const { dependencies } = createDependencies({
    imageStorage: {
      store: async (file) => ({
        storageKey: `cars/${file.vehicleId}/${file.clientFileId}`,
        url: `/uploads/${file.fileName}`
      }),
      remove: async (storageKey) => {
        removedStorageKeys.push(storageKey);
      }
    },
    imageRepository: {
      save: async () => {
        throw new Error("Database unavailable");
      }
    }
  });
  const service = createBulkCarImageUploadService(dependencies);
  const response = await service.processBulkUpload({
    vehicleId: "car-123",
    files: [createFile("file-001")]
  });

  assert.deepEqual(removedStorageKeys, ["cars/car-123/file-001"]);
  assert.equal(response.files[0].status, "failed");
  assert.equal(response.files[0].error.code, "PERSISTENCE_FAILED");
});

test("cleanup failure remains controlled and processing continues", async () => {
  let saveCalls = 0;
  const { dependencies } = createDependencies({
    imageStorage: {
      store: async (file) => ({ storageKey: file.clientFileId, url: `/uploads/${file.originalname}` }),
      remove: async () => {
        throw new Error("Cleanup failed");
      }
    },
    imageRepository: {
      save: async (metadata) => {
        saveCalls += 1;
        if (metadata.clientFileId === "file-001") throw new Error("Persistence failed");
        return { id: `image-${metadata.clientFileId}`, url: metadata.url };
      }
    }
  });
  const service = createBulkCarImageUploadService(dependencies);
  const response = await service.processBulkUpload({
    vehicleId: "car-123",
    files: [createFile("file-001"), createFile("file-002")]
  });

  assert.equal(saveCalls, 2);
  assert.deepEqual(response.files.map((result) => result.status), ["failed", "uploaded"]);
});

test("empty file collection is rejected before processing", async () => {
  const { dependencies } = createDependencies();
  const service = createBulkCarImageUploadService(dependencies);

  await assert.rejects(
    service.processBulkUpload({ vehicleId: "car-123", files: [] }),
    (error) => error.code === "FILE_REQUIRED"
  );
});

test("service rejects incomplete integration boundaries", () => {
  assert.throws(
    () => createBulkCarImageUploadService({}),
    TypeError
  );
});
