function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getImageOptimizationConfig() {
  return {
    maxWidth: parsePositiveInteger(process.env.IMAGE_MAX_WIDTH, 1600),
    maxHeight: parsePositiveInteger(process.env.IMAGE_MAX_HEIGHT, 1600),
    quality: process.env.IMAGE_WEBP_QUALITY || "auto:good",
  };
}

export function buildCloudinaryOptimizedUploadOptions({
  folder = "car-images",
} = {}) {
  const config = getImageOptimizationConfig();

  return {
    folder,
    resource_type: "image",
    format: "webp",
    transformation: [
      {
        width: config.maxWidth,
        height: config.maxHeight,
        crop: "limit",
      },
      {
        quality: config.quality,
        fetch_format: "webp",
      },
    ],
  };
}
