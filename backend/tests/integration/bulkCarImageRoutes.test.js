"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createBulkCarImageController, selectBulkUploadStatus } = require("../../controllers/bulkCarImageController");
const { createCarRouter } = require("../../routes/carRoutes");

const createResponse = () => {
  const activity = { statusCode: null, body: null };
  return {
    activity,
    status(statusCode) {
      activity.statusCode = statusCode;
      return this;
    },
    json(body) {
      activity.body = body;
      return this;
    }
  };
};

const createRequest = () => ({
  params: { id: "car-123" },
  body: { clientFileIds: "[\"file-001\",\"file-002\"]" },
  files: [
    { originalname: "front.jpg", mimetype: "image/jpeg", size: 100, buffer: Buffer.from("front") },
    { originalname: "rear.jpg", mimetype: "image/jpeg", size: 100, buffer: Buffer.from("rear") }
  ]
});

test("route middleware order is authentication authorization upload controller", () => {
  const authenticate = (request, response, next) => next();
  const authorize = (request, response, next) => next();
  const upload = (request, response, next) => next();
  const router = createCarRouter({
    authenticate,
    authorize,
    upload,
    bulkUploadService: { processBulkUpload: async () => ({}) }
  });
  const layer = router.stack.find((entry) => entry.route);
  assert.equal(layer.route.path, "/:id/images/bulk");
  assert.equal(layer.route.methods.post, true);
  assert.equal(layer.route.stack.length, 4);
  assert.equal(layer.route.stack[0].handle, authenticate);
  assert.equal(layer.route.stack[1].handle, authorize);
  assert.equal(layer.route.stack[2].handle, upload);
});

test("complete success returns HTTP 201 with deterministic correlation", async () => {
  let receivedFiles;
  const controller = createBulkCarImageController({
    processBulkUpload: async ({ files }) => {
      receivedFiles = files;
      return {
        carId: "car-123",
        summary: { received: 2, uploaded: 2, rejected: 0, failed: 0 },
        files: [
          { clientFileId: "file-001", status: "uploaded" },
          { clientFileId: "file-002", status: "uploaded" }
        ]
      };
    }
  });
  const response = createResponse();
  await controller.uploadBulkImages(createRequest(), response);
  assert.equal(response.activity.statusCode, 201);
  assert.deepEqual(receivedFiles.map((file) => file.clientFileId), ["file-001", "file-002"]);
  assert.equal(response.activity.body.summary.uploaded, 2);
});

test("partial success returns HTTP 207", async () => {
  const controller = createBulkCarImageController({
    processBulkUpload: async () => ({
      carId: "car-123",
      summary: { received: 2, uploaded: 1, rejected: 1, failed: 0 },
      files: [
        { clientFileId: "file-001", status: "uploaded" },
        { clientFileId: "file-002", status: "rejected" }
      ]
    })
  });
  const response = createResponse();
  await controller.uploadBulkImages(createRequest(), response);
  assert.equal(response.activity.statusCode, 207);
});

test("complete rejection returns HTTP 422", async () => {
  const controller = createBulkCarImageController({
    processBulkUpload: async () => ({
      carId: "car-123",
      summary: { received: 2, uploaded: 0, rejected: 2, failed: 0 },
      files: [
        { clientFileId: "file-001", status: "rejected" },
        { clientFileId: "file-002", status: "rejected" }
      ]
    })
  });
  const response = createResponse();
  await controller.uploadBulkImages(createRequest(), response);
  assert.equal(response.activity.statusCode, 422);
});

test("vehicle-not-found returns HTTP 404", async () => {
  const notFoundError = new Error("Missing vehicle");
  notFoundError.code = "CAR_NOT_FOUND";
  const controller = createBulkCarImageController({
    processBulkUpload: async () => { throw notFoundError; }
  });
  const response = createResponse();
  await controller.uploadBulkImages(createRequest(), response);
  assert.equal(response.activity.statusCode, 404);
  assert.equal(response.activity.body.error.code, "CAR_NOT_FOUND");
});

test("malformed clientFileId correlation returns HTTP 400", async () => {
  const controller = createBulkCarImageController({
    processBulkUpload: async () => assert.fail("service must not execute")
  });
  const request = createRequest();
  request.body.clientFileIds = "[\"file-001\"]";
  const response = createResponse();
  await controller.uploadBulkImages(request, response);
  assert.equal(response.activity.statusCode, 400);
});

test("unexpected service exception returns controlled HTTP 500", async () => {
  const controller = createBulkCarImageController({
    processBulkUpload: async () => { throw new Error("Unexpected failure"); }
  });
  const response = createResponse();
  await controller.uploadBulkImages(createRequest(), response);
  assert.equal(response.activity.statusCode, 500);
  assert.equal(response.activity.body.success, false);
});

test("status selection matches the shared contract", () => {
  assert.equal(selectBulkUploadStatus({ received: 2, uploaded: 2 }), 201);
  assert.equal(selectBulkUploadStatus({ received: 2, uploaded: 1 }), 207);
  assert.equal(selectBulkUploadStatus({ received: 2, uploaded: 0 }), 422);
});
