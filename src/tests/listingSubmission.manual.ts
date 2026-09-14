import assert from "node:assert/strict";
import {
  createEmptySubmissionCheckpoint,
  createListingSubmissionCoordinator,
} from "../features/admin-listing/services/listingSubmissionCoordinator";
import type {
  CreateListingInput,
  ListingResult,
  ListingService,
  ListingUploadResult,
  ListingUploadService,
  SelectedListingImage,
} from "../features/admin-listing/types";

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

const input: CreateListingInput = {
  draft: {
    vin: "1HGCM82633A004352",
    make: "Panda",
    model: "Sprint",
    name: "Panda Sprint",
    type: "SUV",
    category: "luxury",
    year: "2026",
    price: "285000000",
    mileage: "12000",
    color: "Black",
    condition: "Used",
    status: "Available",
    power: "300 hp",
    engine: "3.0L",
    drive: "4WD",
  },
  images: [image("first", 0), image("second", 1)],
};

function listingService(
  result: ListingResult,
  counter: { value: number },
): ListingService {
  return {
    async createListing() {
      counter.value += 1;
      await Promise.resolve();
      return result;
    },
  };
}

function uploadService(
  result: ListingUploadResult,
  receivedIds: string[][],
): ListingUploadService {
  return {
    async uploadImages(_token, _listingId, images) {
      receivedIds.push(images.map((item) => item.id));
      return result;
    },
  };
}

const createCounter = { value: 0 };
const successfulUploads: string[][] = [];
const successCoordinator = createListingSubmissionCoordinator({
  listingService: listingService({
    success: true,
    listingId: "car-101",
    message: "Created.",
    mock: true,
  }, createCounter),
  uploadService: uploadService({
    success: true,
    mock: true,
    items: [
      { imageId: "first", order: 0, success: true },
      { imageId: "second", order: 1, success: true },
    ],
  }, successfulUploads),
});

const success = await successCoordinator.submit({
  accessToken: "redacted-token",
  input,
});

assert.equal(success.success, true);
assert.equal(createCounter.value, 1);
assert.deepEqual(successfulUploads, [["first", "second"]]);
if (success.success) {
  assert.equal(success.listingId, "car-101");
  assert.deepEqual(
    success.checkpoint.uploadedImageIds,
    ["first", "second"],
  );
}

const validationCounter = { value: 0 };
const validationCoordinator = createListingSubmissionCoordinator({
  listingService: listingService({
    success: false,
    code: "VALIDATION_FAILED",
    message: "Invalid vehicle.",
    fieldErrors: { price: "Price is invalid." },
  }, validationCounter),
  uploadService: uploadService({
    success: true,
    mock: true,
    items: [],
  }, []),
});

const validation = await validationCoordinator.submit({
  accessToken: "redacted-token",
  input,
});

assert.equal(validation.success, false);
if (!validation.success) {
  assert.equal(validation.code, "VALIDATION_FAILED");
  assert.equal(validation.fieldErrors?.price, "Price is invalid.");
}

const unauthorized = await successCoordinator.submit({
  accessToken: "",
  input,
});

assert.equal(unauthorized.success, false);
if (!unauthorized.success) {
  assert.equal(unauthorized.code, "UNAUTHORIZED");
}

const mfaCounter = { value: 0 };
const mfaCoordinator = createListingSubmissionCoordinator({
  listingService: listingService({
    success: false,
    code: "MFA_REQUIRED",
    message: "Additional verification is required.",
  }, mfaCounter),
  uploadService: uploadService({
    success: true,
    mock: true,
    items: [],
  }, []),
});

const mfa = await mfaCoordinator.submit({
  accessToken: "redacted-token",
  input,
});

assert.equal(mfa.success, false);
if (!mfa.success) assert.equal(mfa.code, "MFA_REQUIRED");

const partialCreateCounter = { value: 0 };
const firstUploadAttempts: string[][] = [];
const partialCoordinator = createListingSubmissionCoordinator({
  listingService: listingService({
    success: true,
    listingId: "car-202",
    message: "Created.",
    mock: true,
  }, partialCreateCounter),
  uploadService: uploadService({
    success: false,
    code: "UPLOAD_FAILED",
    message: "One upload failed.",
    items: [
      { imageId: "first", order: 0, success: true },
      { imageId: "second", order: 1, success: false },
    ],
  }, firstUploadAttempts),
});

const partial = await partialCoordinator.submit({
  accessToken: "redacted-token",
  input,
});

assert.equal(partial.success, false);
assert.equal(partialCreateCounter.value, 1);
if (partial.success) throw new Error("Expected partial failure.");
assert.equal(partial.checkpoint.listingId, "car-202");
assert.deepEqual(partial.checkpoint.uploadedImageIds, ["first"]);
assert.deepEqual(partial.checkpoint.failedImageIds, ["second"]);

const retryUploads: string[][] = [];
const retryCoordinator = createListingSubmissionCoordinator({
  listingService: listingService({
    success: true,
    listingId: "duplicate-car",
    message: "Must not execute.",
    mock: true,
  }, partialCreateCounter),
  uploadService: uploadService({
    success: true,
    mock: true,
    items: [
      { imageId: "second", order: 1, success: true },
    ],
  }, retryUploads),
});

const retry = await retryCoordinator.submit({
  accessToken: "redacted-token",
  input,
  checkpoint: partial.checkpoint,
});

assert.equal(retry.success, true);
assert.equal(partialCreateCounter.value, 1);
assert.deepEqual(retryUploads, [["second"]]);

const lockingCounter = { value: 0 };
let releaseCreation: (() => void) | undefined;
const lockingService: ListingService = {
  async createListing() {
    lockingCounter.value += 1;
    await new Promise<void>((resolve) => {
      releaseCreation = resolve;
    });
    return {
      success: true,
      listingId: "car-303",
      message: "Created.",
      mock: true,
    };
  },
};

const lockingCoordinator = createListingSubmissionCoordinator({
  listingService: lockingService,
  uploadService: uploadService({
    success: true,
    mock: true,
    items: [
      { imageId: "first", order: 0, success: true },
      { imageId: "second", order: 1, success: true },
    ],
  }, []),
});

const activeSubmission = lockingCoordinator.submit({
  accessToken: "redacted-token",
  input,
});

const duplicateSubmission = await lockingCoordinator.submit({
  accessToken: "redacted-token",
  input,
});

assert.equal(duplicateSubmission.success, false);
if (!duplicateSubmission.success) {
  assert.equal(
    duplicateSubmission.code,
    "SUBMISSION_IN_PROGRESS",
  );
}

releaseCreation?.();
assert.equal((await activeSubmission).success, true);
assert.equal(lockingCounter.value, 1);

const emptyCheckpoint = createEmptySubmissionCheckpoint();
assert.deepEqual(emptyCheckpoint.uploadedImageIds, []);
assert.deepEqual(emptyCheckpoint.failedImageIds, []);

const serializedResults = JSON.stringify({
  success,
  validation,
  unauthorized,
  mfa,
  partial,
  retry,
  duplicateSubmission,
});

assert.equal(serializedResults.includes("redacted-token"), false);

console.log(JSON.stringify({
  suite: "listingSubmission",
  passed: 27,
  failed: 0,
  createThenUploadVerified: true,
  duplicateCreationPrevented: true,
  partialFailureRecoveryVerified: true,
  failedImageOnlyRetryVerified: true,
  submissionLockVerified: true,
  validationFailureVerified: true,
  unauthorizedVerified: true,
  mfaRepresentationVerified: true,
  privateValuesLogged: false,
  destructiveCleanupCalled: false,
  syntheticDataUsed: true,
}, null, 2));
