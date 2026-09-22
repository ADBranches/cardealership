import assert from "node:assert/strict";
import {
  buildCloudinaryOptimizedUploadOptions,
  getImageOptimizationConfig,
} from "../utils/imageOptimization.js";

const originalEnvironment = {
  width: process.env.IMAGE_MAX_WIDTH,
  height: process.env.IMAGE_MAX_HEIGHT,
  quality: process.env.IMAGE_WEBP_QUALITY,
};

delete process.env.IMAGE_MAX_WIDTH;
delete process.env.IMAGE_MAX_HEIGHT;
delete process.env.IMAGE_WEBP_QUALITY;

const defaults = getImageOptimizationConfig();
assert.equal(defaults.maxWidth, 1600);
assert.equal(defaults.maxHeight, 1600);
assert.equal(defaults.quality, "auto:good");

const defaultOptions =
  buildCloudinaryOptimizedUploadOptions();

assert.equal(defaultOptions.folder, "car-images");
assert.equal(defaultOptions.resource_type, "image");
assert.equal(defaultOptions.format, "webp");
assert.deepEqual(defaultOptions.transformation[0], {
  width: 1600,
  height: 1600,
  crop: "limit",
});
assert.deepEqual(defaultOptions.transformation[1], {
  quality: "auto:good",
  fetch_format: "webp",
});

process.env.IMAGE_MAX_WIDTH = "1200";
process.env.IMAGE_MAX_HEIGHT = "900";
process.env.IMAGE_WEBP_QUALITY = "80";

const configuredOptions =
  buildCloudinaryOptimizedUploadOptions({
    folder: "car-images/validation",
  });

assert.equal(configuredOptions.folder, "car-images/validation");
assert.equal(configuredOptions.transformation[0].width, 1200);
assert.equal(configuredOptions.transformation[0].height, 900);
assert.equal(configuredOptions.transformation[1].quality, "80");
assert.equal(
  configuredOptions.transformation[1].fetch_format,
  "webp",
);

process.env.IMAGE_MAX_WIDTH = "invalid";
process.env.IMAGE_MAX_HEIGHT = "0";

const fallbackConfig = getImageOptimizationConfig();
assert.equal(fallbackConfig.maxWidth, 1600);
assert.equal(fallbackConfig.maxHeight, 1600);

for (const [name, value] of Object.entries({
  IMAGE_MAX_WIDTH: originalEnvironment.width,
  IMAGE_MAX_HEIGHT: originalEnvironment.height,
  IMAGE_WEBP_QUALITY: originalEnvironment.quality,
})) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

console.log(JSON.stringify({
  suite: "imageOptimizationContract",
  passed: 15,
  failed: 0,
  externalUploadRequired: false,
  webpOutputConfigured: true,
  dimensionLimitConfigured: true,
  qualityConfigurationVerified: true,
  invalidEnvironmentFallbackVerified: true,
}, null, 2));
