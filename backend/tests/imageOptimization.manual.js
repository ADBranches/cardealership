import fs from "fs/promises";
import path from "path";
import cloudinary from "../config/cloudinary.js";
import { buildCloudinaryOptimizedUploadOptions } from "../utils/imageOptimization.js";

async function uploadOptimizedImage(buffer) {
  const options = buildCloudinaryOptimizedUploadOptions({
    folder: "car-images/manual-tests",
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      },
    );

    stream.end(buffer);
  });
}

function formatBytes(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function maybeCleanup(publicId) {
  if (process.env.IMAGE_TEST_CLEANUP !== "true") {
    return;
  }

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });
}

async function main() {
  const inputPath = process.argv[2];

  if (!inputPath) {
    console.error(
      "Usage: node backend/tests/imageOptimization.manual.js <path-to-local-image>",
    );
    process.exit(1);
  }

  const absolutePath = path.resolve(process.cwd(), inputPath);
  const originalBuffer = await fs.readFile(absolutePath);
  const originalBytes = originalBuffer.length;

  const result = await uploadOptimizedImage(originalBuffer);
  const transformedBytes = Number(result?.bytes || 0);
  const savedBytes = originalBytes - transformedBytes;
  const reductionPercent =
    originalBytes > 0
      ? Number(((savedBytes / originalBytes) * 100).toFixed(2))
      : 0;

  const report = {
    input: absolutePath,
    outputUrl: result?.secure_url,
    format: result?.format,
    originalBytes,
    transformedBytes,
    savedBytes,
    reductionPercent,
  };

  console.log("Optimization report:");
  console.log(JSON.stringify(report, null, 2));

  await maybeCleanup(result?.public_id);

  if (result?.format !== "webp") {
    console.error("Verification failed: output format is not webp.");
    process.exit(1);
  }

  if (savedBytes <= 0) {
    console.error(
      "Verification failed: transformed image is not smaller than original.",
    );
    process.exit(1);
  }

  console.log(
    "Verification passed: output is webp and payload size was reduced.",
  );
}

main().catch((error) => {
  console.error("Image optimization manual test failed:", error.message);
  process.exit(1);
});
