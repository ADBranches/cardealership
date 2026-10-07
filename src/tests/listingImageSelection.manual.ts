import assert from "node:assert/strict";
import { createImageFingerprint, createSelectedListingImages, LISTING_IMAGE_MAX_BYTES, normalizeSelectedImageOrder, validateImageSelection } from "../features/admin-listing/validation/imageSelectionValidation";
import type { SelectedListingImage } from "../features/admin-listing/types";

function syntheticFile(name: string, type: string, size: number, lastModified: number): File {
  return { name, type, size, lastModified } as File;
}

const first = syntheticFile("front.jpg", "image/jpeg", 1024, 1001);
const second = syntheticFile("rear.webp", "image/webp", 2048, 1002);
const third = syntheticFile("interior.png", "image/png", 4096, 1003);
const invalid = syntheticFile("notes.txt", "text/plain", 512, 1004);
const oversized = syntheticFile("large.jpg", "image/jpeg", LISTING_IMAGE_MAX_BYTES + 1, 1005);

assert.equal(createImageFingerprint(first), "front.jpg:1024:1001:image/jpeg");
const accepted = validateImageSelection([], [first, second], { maximumFiles: 3 });
assert.deepEqual(accepted.accepted.map((file) => file.name), ["front.jpg", "rear.webp"]);
assert.equal(accepted.rejected.length, 0);
const duplicate = validateImageSelection([], [first, first], { maximumFiles: 3 });
assert.equal(duplicate.accepted.length, 1);
assert.equal(duplicate.rejected[0].code, "DUPLICATE_IMAGE");
assert.equal(validateImageSelection([], [invalid], { maximumFiles: 3 }).rejected[0].code, "INVALID_IMAGE_TYPE");
assert.equal(validateImageSelection([], [oversized], { maximumFiles: 3 }).rejected[0].code, "IMAGE_TOO_LARGE");

const existing: SelectedListingImage = { id: "existing", file: first, order: 0, imageType: "primary", previewUrl: "blob:existing" };
assert.equal(validateImageSelection([existing], [first], { maximumFiles: 3 }).rejected[0].code, "DUPLICATE_IMAGE");
const limited = validateImageSelection([existing], [second, third], { maximumFiles: 2 });
assert.equal(limited.accepted.length, 1);
assert.equal(limited.rejected[0].code, "IMAGE_LIMIT_EXCEEDED");

const previewFiles: File[] = [];
const selected = createSelectedListingImages([first, second], 0, (_file, index) => `selected-${index}`, (file) => {
  previewFiles.push(file);
  return `blob:${file.name}`;
});
assert.deepEqual(selected.map((image) => image.order), [0, 1]);
assert.deepEqual(selected.map((image) => image.imageType), ["primary", "general"]);
assert.deepEqual(previewFiles, [first, second]);
const reordered = normalizeSelectedImageOrder([{ ...selected[1], order: 9 }, { ...selected[0], order: 4, imageType: "general" }]);
assert.deepEqual(reordered.map((image) => image.order), [0, 1]);
assert.equal(reordered[0].imageType, "primary");
assert.equal(validateImageSelection([], [first], { maximumFiles: 0 }).rejected[0].code, "IMAGE_LIMIT_EXCEEDED");

console.log(JSON.stringify({ suite: "listingImageSelection", passed: 16, failed: 0, injectableLimitVerified: true, mimeValidationVerified: true, sizeValidationVerified: true, duplicateDetectionVerified: true, deterministicOrderingVerified: true, previewFactoryVerified: true, syntheticDataUsed: true, backendCallMade: false }, null, 2));
