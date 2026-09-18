"use strict";

const nodePath = require("node:path");
const { BULK_IMAGE_UPLOAD_ERROR_CODES } = require("../contracts/bulkImageUpload.contract");

const createUploadValidationError = (code, message) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

const sanitizeImageFilename = (originalName) => {
  const baseName = nodePath.basename(String(originalName || "")).normalize("NFKC");
  const sanitizedName = baseName.replace(/[^A-Za-z0-9._-]/g, "_").replace(/_+/g, "_").replace(/^[._-]+/, "");
  if (!sanitizedName) return "image";
  return sanitizedName.slice(0, 180);
};

const createImageUploadValidator = (configuration) => {
  const allowedMimeTypes = new Set(configuration.allowedMimeTypes);
  const allowedExtensions = new Set(configuration.allowedExtensions);

  const validateImageUpload = (file) => {
    if (!file || typeof file !== "object") {
      throw createUploadValidationError(BULK_IMAGE_UPLOAD_ERROR_CODES.FILE_REQUIRED, "An image file is required.");
    }

    if (!allowedMimeTypes.has(file.mimetype)) {
      throw createUploadValidationError(BULK_IMAGE_UPLOAD_ERROR_CODES.UNSUPPORTED_MIME_TYPE, "The image MIME type is not supported.");
    }

    const sanitizedFileName = sanitizeImageFilename(file.originalname);
    const extension = nodePath.extname(sanitizedFileName).toLowerCase();

    if (!allowedExtensions.has(extension)) {
      throw createUploadValidationError(BULK_IMAGE_UPLOAD_ERROR_CODES.UNSUPPORTED_EXTENSION, "The image file extension is not supported.");
    }

    if (!Number.isFinite(file.size) || file.size <= 0 || file.size > configuration.maxFileSizeBytes) {
      throw createUploadValidationError(BULK_IMAGE_UPLOAD_ERROR_CODES.FILE_TOO_LARGE, "The image file size is invalid or exceeds the permitted limit.");
    }

    return Object.freeze({
      ...file,
      originalname: sanitizedFileName
    });
  };

  return validateImageUpload;
};

module.exports = Object.freeze({
  createImageUploadValidator,
  createUploadValidationError,
  sanitizeImageFilename
});
