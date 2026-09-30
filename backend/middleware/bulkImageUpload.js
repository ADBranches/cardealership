import multer from "multer";
import configuration from "../config/bulkImageUpload.js";
import {
  BULK_IMAGE_UPLOAD_ERROR_CODES,
} from "../contracts/bulkImageUpload.contract.js";
import {
  createImageUploadValidator,
} from "../utils/validateImageUpload.js";

const validateImageUpload =
  createImageUploadValidator(configuration);

export const mapMulterError = (error) => {
  if (!error) return null;

  if (error.code === "LIMIT_FILE_SIZE") {
    return Object.freeze({
      code: BULK_IMAGE_UPLOAD_ERROR_CODES.FILE_TOO_LARGE,
      message: "An image exceeds the permitted size limit.",
    });
  }

  if (error.code === "LIMIT_FILE_COUNT") {
    return Object.freeze({
      code: BULK_IMAGE_UPLOAD_ERROR_CODES.TOO_MANY_FILES,
      message: "Too many image files were submitted.",
    });
  }

  if (error.code === "LIMIT_UNEXPECTED_FILE") {
    return Object.freeze({
      code: BULK_IMAGE_UPLOAD_ERROR_CODES.UNEXPECTED_FIELD,
      message: "The multipart field name is not permitted.",
    });
  }

  return Object.freeze({
    code:
      error.code ||
      BULK_IMAGE_UPLOAD_ERROR_CODES.UNEXPECTED_FIELD,
    message:
      error.message || "The multipart request is invalid.",
  });
};

export const multipartParser = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: configuration.maxFiles,
    fileSize: configuration.maxFileSizeBytes,
  },
  fileFilter(request, file, callback) {
    try {
      validateImageUpload({
        ...file,
        size: 1,
      });
      callback(null, true);
    } catch (error) {
      callback(error);
    }
  },
}).array(
  configuration.fieldName,
  configuration.maxFiles,
);

export const bulkImageUpload = (
  request,
  response,
  next,
) => {
  multipartParser(request, response, (error) => {
    if (error) {
      const mappedError = mapMulterError(error);
      const statusCode =
        mappedError.code ===
        BULK_IMAGE_UPLOAD_ERROR_CODES.FILE_TOO_LARGE
          ? 413
          : 400;

      return response.status(statusCode).json({
        success: false,
        error: mappedError,
      });
    }

    if (!request.files || request.files.length === 0) {
      return response.status(400).json({
        success: false,
        error: {
          code: BULK_IMAGE_UPLOAD_ERROR_CODES.FILE_REQUIRED,
          message: "At least one image file is required.",
        },
      });
    }

    try {
      request.files = request.files.map(validateImageUpload);
      return next();
    } catch (validationError) {
      const statusCode =
        validationError.code ===
        BULK_IMAGE_UPLOAD_ERROR_CODES.FILE_TOO_LARGE
          ? 413
          : 400;

      return response.status(statusCode).json({
        success: false,
        error: {
          code: validationError.code,
          message: validationError.message,
        },
      });
    }
  });
};
