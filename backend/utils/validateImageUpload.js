import path from "node:path";
import {
  BULK_IMAGE_UPLOAD_ERROR_CODES,
} from "../contracts/bulkImageUpload.contract.js";

const createValidationError = (code, message) =>
  Object.assign(new Error(message), { code });

export const createImageUploadValidator = (configuration) => {
  if (!configuration) {
    throw new TypeError(
      "Bulk image-upload configuration is required.",
    );
  }

  return (file) => {
    if (!file || typeof file !== "object") {
      throw createValidationError(
        BULK_IMAGE_UPLOAD_ERROR_CODES.FILE_REQUIRED,
        "A valid image file is required.",
      );
    }

    const mimeType = String(file.mimetype || "").toLowerCase();
    const extension = path.extname(
      String(file.originalname || ""),
    ).toLowerCase();
    const fileSize = Number(file.size);

    if (!configuration.allowedMimeTypes.includes(mimeType)) {
      throw createValidationError(
        BULK_IMAGE_UPLOAD_ERROR_CODES.UNSUPPORTED_MIME_TYPE,
        "The image MIME type is not supported.",
      );
    }

    if (!configuration.allowedExtensions.includes(extension)) {
      throw createValidationError(
        BULK_IMAGE_UPLOAD_ERROR_CODES.UNSUPPORTED_EXTENSION,
        "The image file extension is not supported.",
      );
    }

    if (
      !Number.isFinite(fileSize) ||
      fileSize <= 0
    ) {
      throw createValidationError(
        BULK_IMAGE_UPLOAD_ERROR_CODES.FILE_REQUIRED,
        "The image file must not be empty.",
      );
    }

    if (fileSize > configuration.maxFileSizeBytes) {
      throw createValidationError(
        BULK_IMAGE_UPLOAD_ERROR_CODES.FILE_TOO_LARGE,
        "The image exceeds the permitted size limit.",
      );
    }

    return Object.freeze({
      ...file,
      originalname: String(file.originalname),
      mimetype: mimeType,
      size: fileSize,
    });
  };
};
