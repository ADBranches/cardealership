import test from "node:test";
import assert from "node:assert/strict";
import {
  createBulkCarImageController,
  parseClientFileIds,
  selectBulkUploadStatus,
} from "../../controllers/bulkCarImageController.js";

test("client file IDs remain unique and correlated", () => {
  assert.deepEqual(
    parseClientFileIds(
      {
        body: {
          clientFileIds: JSON.stringify(["front", "rear"]),
        },
      },
      2,
    ),
    ["front", "rear"],
  );

  assert.throws(
    () =>
      parseClientFileIds(
        {
          body: {
            clientFileIds: JSON.stringify(["same", "same"]),
          },
        },
        2,
      ),
    (error) => error.code === "FILE_REQUIRED",
  );
});

test("HTTP result status follows upload summary", () => {
  assert.equal(
    selectBulkUploadStatus({ received: 2, uploaded: 2 }),
    201,
  );
  assert.equal(
    selectBulkUploadStatus({ received: 2, uploaded: 1 }),
    207,
  );
  assert.equal(
    selectBulkUploadStatus({ received: 2, uploaded: 0 }),
    422,
  );
});

test("controller returns partial-success HTTP 207", async () => {
  const controller = createBulkCarImageController({
    async uploadFiles() {
      return {
        carId: 7,
        summary: {
          received: 2,
          uploaded: 1,
          rejected: 0,
          failed: 1,
        },
        files: [],
      };
    },
  });

  const activity = {};
  const response = {
    status(value) {
      activity.status = value;
      return this;
    },
    json(value) {
      activity.body = value;
      return this;
    },
  };

  await controller.uploadBulkImages(
    {
      params: { id: "7" },
      body: {
        clientFileIds: JSON.stringify(["front", "rear"]),
      },
      files: [
        { originalname: "front.jpg" },
        { originalname: "rear.jpg" },
      ],
    },
    response,
  );

  assert.equal(activity.status, 207);
  assert.equal(activity.body.success, true);
});
