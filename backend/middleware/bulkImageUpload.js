"use strict";

const multer = require("multer");
const configuration = require("../config");
const { BULK_IMAGE_UPLOAD_ERROR_CODES } = require("../contracts/bulkImageUpload.contract");
const { createImageUploadValidator } = require("../utils/validateImageUpload");

const validateImageUpload = createImageUploadValidator(configuration.bulkImageUpload);

const multipartParser = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: configuration.bulkImageUpload.maxFiles,
    fileSize: configuration.bulkImageUpload.maxFileSizeBytes
  },
  fileFilter: (request, file, callback) => {
    try {
      validateImageUpload({ ...file, size: 1 });
      callback(null, true);
    } catch (error) {
      callback(error);
    }
  }
}).array(configuration.bulkImageUpload.fieldName, configuration.bulkImageUpload.maxFiles);

const mapMulterError = (error) => {
  if (!error) return null;
  if (error.code === "LIMIT_FILE_SIZE") return Object.freeze({ code: BULK_IMAGE_UPLOAD_ERROR_CODES.FILE_TOO_LARGE, message: "An image exceeds the permitted size limit." });
  if (error.code === "LIMIT_FILE_COUNT") return Object.freeze({ code: BULK_IMAGE_UPLOAD_ERROR_CODES.TOO_MANY_FILES, message: "Too many image files were submitted." });
  if (error.code === "LIMIT_UNEXPECTED_FILE") return Object.freeze({ code: BULK_IMAGE_UPLOAD_ERROR_CODES.UNEXPECTED_FIELD, message: "The multipart field name is not permitted." });
  return Object.freeze({ code: error.code || BULK_IMAGE_UPLOAD_ERROR_CODES.UNEXPECTED_FIELD, message: error.message || "The multipart request is invalid." });
};

const bulkImageUpload = (request, response, next) => {
  multipartParser(request, response, (error) => {
    if (error) {
      const mappedError = mapMulterError(error);
      return response.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({ success: false, error: mappedError });
    }

    if (!request.files || request.files.length === 0) {
      return response.status(400).json({ success: false, error: { code: BULK_IMAGE_UPLOAD_ERROR_CODES.FILE_REQUIRED, message: "At least one image file is required." } });
    }

    try {
      request.files = request.files.map(validateImageUpload);
      return next();
    } catch (validationError) {
      return response.status(validationError.code === BULK_IMAGE_UPLOAD_ERROR_CODES.FILE_TOO_LARGE ? 413 : 400).json({ success: false, error: { code: validationError.code, message: validationError.message } });
    }
  });
};

module.exports = Object.freeze({
  bulkImageUpload,
  mapMulterError,
  multipartParser
});
