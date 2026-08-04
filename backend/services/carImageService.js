// backend/services/carImageService.js

import sharp from "sharp";

import cloudinary from "../config/cloudinary.js";
import { saveCarImage } from "../models/carsModel.js";

import { getImageOptimizationConfig } from "../utils/imageOptimization.js";

function uploadBufferToCloudinary(fileBuffer, { folder, publicId }) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,

        public_id: publicId,

        resource_type: "image",

        format: "webp",

        overwrite: false,

        unique_filename: true,
      },

      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(
            new Error(
              "Cloudinary completed without returning an upload result.",
            ),
          );

          return;
        }

        resolve(result);
      },
    );

    stream.on("error", reject);

    stream.end(fileBuffer);
  });
}

/**
 * Upload a car image:
 *
 * 1. Validate the uploaded file.
 * 2. Read the original image information.
 * 3. Correct smartphone image orientation.
 * 4. Resize oversized images.
 * 5. Compress and convert the image to WebP.
 * 6. Upload the optimized WebP image to Cloudinary.
 * 7. Save the Cloudinary URL in PostgreSQL.
 * 8. Return optimization evidence.
 */
export const uploadCarImageService = async ({
  fileBuffer,
  carId,
  imageType = "general",
}) => {
  if (!Buffer.isBuffer(fileBuffer)) {
    throw new Error("A valid image buffer is required.");
  }

  const parsedCarId = Number(carId);

  if (!Number.isInteger(parsedCarId) || parsedCarId <= 0) {
    throw new Error("A valid carId is required.");
  }

  const allowedImageTypes = [
    "primary",

    "general",

    "front",

    "rear",

    "interior",

    "engine",
  ];

  const normalizedImageType = allowedImageTypes.includes(imageType)
    ? imageType
    : "general";

  const optimization = getImageOptimizationConfig();

  /*
  |--------------------------------------------------------------------------
  | 1. Read original image information
  |--------------------------------------------------------------------------
  */

  const originalMetadata = await sharp(fileBuffer).metadata();

  /*
  |--------------------------------------------------------------------------
  | 2. Resize, compress and convert to WebP
  |--------------------------------------------------------------------------
  */

  const optimizedBuffer = await sharp(fileBuffer)
    // Correct smartphone EXIF orientation.
    .rotate()

    // Resize only when the image exceeds the configured dimensions.
    .resize({
      width: optimization.maxWidth,

      height: optimization.maxHeight,

      fit: "inside",

      withoutEnlargement: true,
    })

    // Convert the uploaded image to lightweight WebP.
    .webp({
      quality: 80,

      effort: 4,
    })

    .toBuffer();

  const optimizedMetadata = await sharp(optimizedBuffer).metadata();

  /*
  |--------------------------------------------------------------------------
  | 3. Upload optimized WebP image to Cloudinary
  |--------------------------------------------------------------------------
  */

  const uploadResult = await uploadBufferToCloudinary(optimizedBuffer, {
    folder: "car-images",

    publicId: `car-${parsedCarId}-${Date.now()}`,
  });

  /*
  |--------------------------------------------------------------------------
  | 4. Save Cloudinary image URL in PostgreSQL
  |--------------------------------------------------------------------------
  */

  let savedImage;

  try {
    savedImage = await saveCarImage(
      parsedCarId,

      uploadResult.secure_url,

      normalizedImageType,
    );
  } catch (databaseError) {
    /*
    If PostgreSQL saving fails, remove the image
    from Cloudinary to prevent orphaned files.
    */

    if (uploadResult.public_id) {
      try {
        await cloudinary.uploader.destroy(uploadResult.public_id);
      } catch (cleanupError) {
        console.error(
          "Cloudinary cleanup failed after database error:",
          cleanupError.message,
        );
      }
    }

    throw databaseError;
  }

  /*
  |--------------------------------------------------------------------------
  | 5. Calculate optimization results
  |--------------------------------------------------------------------------
  */

  const originalBytes = fileBuffer.length;

  const optimizedBytes = optimizedBuffer.length;

  const reductionPercentage =
    originalBytes > 0
      ? Number(
          (((originalBytes - optimizedBytes) / originalBytes) * 100).toFixed(2),
        )
      : 0;

  /*
  |--------------------------------------------------------------------------
  | 6. Return proof of the completed pipeline
  |--------------------------------------------------------------------------
  */

  return {
    database: savedImage,

    cloudinary: {
      publicId: uploadResult.public_id,

      secureUrl: uploadResult.secure_url,

      resourceType: uploadResult.resource_type,

      format: uploadResult.format,

      width: uploadResult.width,

      height: uploadResult.height,

      bytes: uploadResult.bytes,

      createdAt: uploadResult.created_at,
    },

    optimization: {
      original: {
        format: originalMetadata.format || "unknown",

        width: originalMetadata.width || null,

        height: originalMetadata.height || null,

        bytes: originalBytes,
      },

      optimized: {
        format: optimizedMetadata.format || "webp",

        width: optimizedMetadata.width || null,

        height: optimizedMetadata.height || null,

        bytes: optimizedBytes,
      },

      maxWidth: optimization.maxWidth,

      maxHeight: optimization.maxHeight,

      requestedFormat: "webp",

      reductionPercentage,
    },
  };
};
