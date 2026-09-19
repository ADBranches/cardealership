import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";
import {
  BULK_IMAGE_UPLOAD_ERROR_CODES,
} from "../contracts/bulkImageUpload.contract.js";

const createStorageError = (message, cause) =>
  Object.assign(new Error(message), {
    code: BULK_IMAGE_UPLOAD_ERROR_CODES.STORAGE_FAILED,
    cause,
  });

const uploadBuffer = (
  cloudinaryClient,
  buffer,
  options,
) =>
  new Promise((resolve, reject) => {
    const uploadStream =
      cloudinaryClient.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(result);
        },
      );

    uploadStream.end(buffer);
  });

export const createBulkImageStorage = (
  options = {},
) => {
  const cloudinaryClient =
    options.cloudinaryClient || cloudinary;
  const imageProcessor = options.imageProcessor || sharp;
  const folder =
    options.folder ||
    process.env.CLOUDINARY_CAR_IMAGE_FOLDER ||
    "car-dealership/cars";

  const upload = async ({ carId, file }) => {
    if (!file?.buffer || !Buffer.isBuffer(file.buffer)) {
      throw createStorageError(
        "The image buffer is missing.",
      );
    }

    try {
      const optimizedBuffer = await imageProcessor(
        file.buffer,
      )
        .rotate()
        .resize({
          width: 2000,
          height: 2000,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer();

      const result = await uploadBuffer(
        cloudinaryClient,
        optimizedBuffer,
        {
          folder: `${folder}/${carId}`,
          resource_type: "image",
          format: "webp",
          overwrite: false,
          unique_filename: true,
        },
      );

      if (!result?.secure_url || !result?.public_id) {
        throw new Error(
          "Cloudinary returned an incomplete response.",
        );
      }

      return Object.freeze({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width || null,
        height: result.height || null,
        format: result.format || "webp",
        bytes: result.bytes || optimizedBuffer.length,
      });
    } catch (error) {
      if (
        error.code ===
        BULK_IMAGE_UPLOAD_ERROR_CODES.STORAGE_FAILED
      ) {
        throw error;
      }

      throw createStorageError(
        "The image could not be stored.",
        error,
      );
    }
  };

  const remove = async (publicId) => {
    if (!publicId) return false;

    try {
      const result =
        await cloudinaryClient.uploader.destroy(
          publicId,
          {
            resource_type: "image",
            invalidate: true,
          },
        );

      return [
        "ok",
        "not found",
      ].includes(result?.result);
    } catch (error) {
      throw createStorageError(
        "The stored image could not be removed.",
        error,
      );
    }
  };

  return Object.freeze({
    upload,
    remove,
  });
};
