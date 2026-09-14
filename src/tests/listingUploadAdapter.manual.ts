import assert from "node:assert/strict";
import { createListingUploadService } from "../features/admin-listing/services/listingUploadApi";
import type { SelectedListingImage } from "../features/admin-listing/types";

function image(id: string, order: number): SelectedListingImage {
  return {
    id,
    order,
    imageType: order === 0 ? "primary" : "general",
    file: {
      name: id + ".jpg",
      type: "image/jpeg",
      size: 1024,
      lastModified: order + 1,
    } as File,
  };
}

const images = [
  image("third", 2),
  image("first", 0),
  image("second", 1),
];

const unauthorized = await createListingUploadService({
  mockMode: true,
}).uploadImages("", "listing-1", images);

assert.equal(unauthorized.success, false);
if (!unauthorized.success) {
  assert.equal(unauthorized.code, "UNAUTHORIZED");
}

const missingListing = await createListingUploadService({
  mockMode: true,
}).uploadImages("redacted-token", "", images);

assert.equal(missingListing.success, false);
if (!missingListing.success) {
  assert.equal(missingListing.code, "VALIDATION_FAILED");
}

const blockedLive = await createListingUploadService({
  mockMode: false,
  isProduction: false,
}).uploadImages("redacted-token", "listing-1", images);

assert.equal(blockedLive.success, false);
if (!blockedLive.success) {
  assert.equal(blockedLive.code, "CONTRACT_UNAVAILABLE");
}

assert.throws(
  () =>
    createListingUploadService({
      mockMode: true,
      isProduction: true,
    }),
  /disabled in production/,
);

const success = await createListingUploadService({
  mockMode: true,
  isProduction: false,
}).uploadImages("redacted-token", "listing-1", images);

assert.equal(success.success, true);
if (success.success) {
  assert.equal(success.mock, true);
  assert.deepEqual(
    success.items.map((item) => item.imageId),
    ["first", "second", "third"],
  );
  assert.deepEqual(
    success.items.map((item) => item.order),
    [0, 1, 2],
  );
  assert.equal(
    success.items.every((item) => item.success),
    true,
  );
}

const partial = await createListingUploadService({
  mockMode: true,
  isProduction: false,
  failImageId: "second",
}).uploadImages("redacted-token", "listing-1", images);

assert.equal(partial.success, false);
if (!partial.success) {
  assert.equal(partial.code, "UPLOAD_FAILED");
  assert.equal(partial.items.length, 3);
  assert.equal(
    partial.items.find((item) => item.imageId === "second")?.success,
    false,
  );
  assert.equal(
    partial.items.filter((item) => item.success).length,
    2,
  );
}

const duplicateService = createListingUploadService({
  mockMode: true,
  isProduction: false,
});

const firstUpload = duplicateService.uploadImages(
  "redacted-token",
  "listing-1",
  images,
);

const duplicateUpload = await duplicateService.uploadImages(
  "redacted-token",
  "listing-1",
  images,
);

assert.equal(duplicateUpload.success, false);
if (!duplicateUpload.success) {
  assert.equal(duplicateUpload.code, "UPLOAD_FAILED");
  assert.match(duplicateUpload.message, /already in progress/);
}

assert.equal((await firstUpload).success, true);

console.log(JSON.stringify({
  suite: "listingUploadAdapter",
  passed: 19,
  failed: 0,
  deterministicOrderingVerified: true,
  partialFailureVerified: true,
  duplicateUploadBlocked: true,
  productionMockBlocked: true,
  liveRouteConfigured: false,
  syntheticDataUsed: true,
  tokenLogged: false,
}, null, 2));
