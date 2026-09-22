import test from "node:test";
import assert from "node:assert/strict";
import {
  createBulkCarImageUploadService,
} from "../../services/bulkCarImageUploadService.js";

const files = [
  {
    clientFileId: "front",
    originalname: "front.jpg",
    mimetype: "image/jpeg",
    size: 100,
    buffer: Buffer.from("front"),
  },
  {
    clientFileId: "rear",
    originalname: "rear.jpg",
    mimetype: "image/jpeg",
    size: 120,
    buffer: Buffer.from("rear"),
  },
];

test("all files upload independently", async () => {
  let imageId = 0;

  const service = createBulkCarImageUploadService({
    carRepository: {
      findById: async () => ({ id: 7 }),
    },
    imageRepository: {
      create: async (image) => ({
        id: ++imageId,
        url: image.url,
      }),
    },
    storage: {
      upload: async ({ file }) => ({
        url: `https://images.test/${file.originalname}`,
        publicId: file.originalname,
      }),
      remove: async () => true,
    },
  });

  const result = await service.uploadFiles({
    carId: 7,
    files,
  });

  assert.equal(result.summary.received, 2);
  assert.equal(result.summary.uploaded, 2);
  assert.equal(result.summary.failed, 0);
  assert.equal(result.files[0].clientFileId, "front");
});

test("one failure does not block another file", async () => {
  const removed = [];

  const service = createBulkCarImageUploadService({
    carRepository: {
      findById: async () => ({ id: 7 }),
    },
    imageRepository: {
      create: async (image) => {
        if (image.fileName === "front.jpg") {
          throw Object.assign(new Error("database offline"), {
            code: "PERSISTENCE_FAILED",
          });
        }

        return {
          id: 2,
          url: image.url,
        };
      },
    },
    storage: {
      upload: async ({ file }) => ({
        url: `https://images.test/${file.originalname}`,
        publicId: file.originalname,
      }),
      remove: async (publicId) => {
        removed.push(publicId);
        return true;
      },
    },
  });

  const result = await service.uploadFiles({
    carId: 7,
    files,
  });

  assert.equal(result.summary.uploaded, 1);
  assert.equal(result.summary.failed, 1);
  assert.deepEqual(removed, ["front.jpg"]);
  assert.equal(
    result.files[0].error.code,
    "PERSISTENCE_FAILED",
  );
});

test("missing vehicle produces a controlled error", async () => {
  const service = createBulkCarImageUploadService({
    carRepository: {
      findById: async () => null,
    },
    imageRepository: {
      create: async () => ({}),
    },
    storage: {
      upload: async () => ({}),
      remove: async () => true,
    },
  });

  await assert.rejects(
    service.uploadFiles({
      carId: 999,
      files,
    }),
    (error) => error.code === "CAR_NOT_FOUND",
  );
});
