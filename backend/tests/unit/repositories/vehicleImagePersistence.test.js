"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const nodePath = require("node:path");
const { createVehicleRepository } = require("../../../repositories/vehicleRepository");
const { createVehicleImageRepository } = require("../../../repositories/vehicleImageRepository");
const { createLocalImageStorage } = require("../../../services/storage/localImageStorage");

test("vehicle repository performs deterministic ID lookup", async () => {
  const activity = {};
  const expectedVehicle = { id: "vehicle-1" };
  const repository = createVehicleRepository({
    findById(vehicleId) {
      activity.vehicleId = vehicleId;
      return { exec: async () => expectedVehicle };
    }
  });
  const result = await repository.findById("vehicle-1");
  assert.equal(activity.vehicleId, "vehicle-1");
  assert.equal(result, expectedVehicle);
});

test("vehicle image repository saves supplied metadata", async () => {
  const activity = {};
  const repository = createVehicleImageRepository({
    create: async (metadata) => {
      activity.metadata = metadata;
      return { id: "image-1", ...metadata };
    }
  });
  const result = await repository.save({ vehicleId: "vehicle-1", clientFileId: "file-1" });
  assert.equal(activity.metadata.clientFileId, "file-1");
  assert.equal(result.id, "image-1");
});

test("local storage writes and removes an image safely", async () => {
  const temporaryRoot = await fs.promises.mkdtemp(nodePath.join(os.tmpdir(), "sprint9-images-"));
  const storage = createLocalImageStorage({ storageRoot: temporaryRoot, publicPrefix: "/test-images" });
  const result = await storage.store({
    vehicleId: "vehicle-1",
    clientFileId: "file-1",
    fileName: "../../unsafe vehicle.jpg",
    buffer: Buffer.from("image-data")
  });
  const storedPath = storage.resolveStoragePath(result.storageKey);
  assert.equal(await fs.promises.readFile(storedPath, "utf8"), "image-data");
  assert.equal(result.url.startsWith("/test-images/vehicle-1/"), true);
  await storage.remove(result.storageKey);
  await assert.rejects(fs.promises.access(storedPath));
  await fs.promises.rm(temporaryRoot, { recursive: true, force: true });
});

test("local storage rejects escaped storage paths", () => {
  const storage = createLocalImageStorage({ storageRoot: nodePath.join(os.tmpdir(), "sprint9-safe-root") });
  assert.throws(() => storage.resolveStoragePath("../../outside.jpg"), /Unsafe storage path/);
});
