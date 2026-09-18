"use strict";

const {
  BULK_IMAGE_UPLOAD_ERROR_CODES,
  BULK_IMAGE_UPLOAD_HTTP_STATUSES
} = require("../contracts/bulkImageUpload.contract");

const parseClientFileIds = (request, fileCount) => {
  const rawValue = request.body && request.body.clientFileIds;
  let clientFileIds = [];

  if (Array.isArray(rawValue)) {
    clientFileIds = rawValue;
  } else if (typeof rawValue === "string" && rawValue.trim()) {
    try {
      const parsedValue = JSON.parse(rawValue);
      clientFileIds = Array.isArray(parsedValue) ? parsedValue : rawValue.split(",");
    } catch (error) {
      clientFileIds = rawValue.split(",");
    }
  }

  if (clientFileIds.length !== fileCount) {
    const correlationError = new Error("Every file must have one clientFileId.");
    correlationError.code = BULK_IMAGE_UPLOAD_ERROR_CODES.FILE_REQUIRED;
    throw correlationError;
  }

  const normalizedIds = clientFileIds.map((value) => String(value).trim());

  if (normalizedIds.some((value) => !value) || new Set(normalizedIds).size !== normalizedIds.length) {
    const correlationError = new Error("clientFileId values must be non-empty and unique.");
    correlationError.code = BULK_IMAGE_UPLOAD_ERROR_CODES.FILE_REQUIRED;
    throw correlationError;
  }

  return normalizedIds;
};

const selectBulkUploadStatus = (summary) => {
  if (summary.uploaded === summary.received) {
    return BULK_IMAGE_UPLOAD_HTTP_STATUSES.COMPLETE_SUCCESS;
  }

  if (summary.uploaded > 0) {
    return BULK_IMAGE_UPLOAD_HTTP_STATUSES.PARTIAL_SUCCESS;
  }

  return BULK_IMAGE_UPLOAD_HTTP_STATUSES.COMPLETE_REJECTION;
};

const createBulkCarImageController = (bulkUploadService) => {
  if (!bulkUploadService || typeof bulkUploadService.processBulkUpload !== "function") {
    throw new TypeError("Bulk image-upload service must implement processBulkUpload.");
  }

  const uploadBulkImages = async (request, response) => {
    try {
      const clientFileIds = parseClientFileIds(request, request.files.length);
      const correlatedFiles = request.files.map((file, index) => Object.freeze({
        ...file,
        clientFileId: clientFileIds[index]
      }));

      const result = await bulkUploadService.processBulkUpload({
        vehicleId: request.params.id,
        files: correlatedFiles
      });

      return response.status(selectBulkUploadStatus(result.summary)).json({
        success: result.summary.uploaded > 0,
        ...result
      });
    } catch (error) {
      if (error.code === BULK_IMAGE_UPLOAD_ERROR_CODES.CAR_NOT_FOUND) {
        return response.status(BULK_IMAGE_UPLOAD_HTTP_STATUSES.VEHICLE_NOT_FOUND).json({
          success: false,
          error: {
            code: BULK_IMAGE_UPLOAD_ERROR_CODES.CAR_NOT_FOUND,
            message: "The target vehicle was not found."
          }
        });
      }

      if (error.code === BULK_IMAGE_UPLOAD_ERROR_CODES.FILE_REQUIRED) {
        return response.status(BULK_IMAGE_UPLOAD_HTTP_STATUSES.REQUEST_REJECTED).json({
          success: false,
          error: {
            code: error.code,
            message: error.message
          }
        });
      }

      return response.status(BULK_IMAGE_UPLOAD_HTTP_STATUSES.SERVER_FAILURE).json({
        success: false,
        error: {
          code: error.code || "BULK_IMAGE_UPLOAD_SERVER_FAILURE",
          message: "The bulk image-upload request could not be completed."
        }
      });
    }
  };

  return Object.freeze({
    uploadBulkImages
  });
};

module.exports = Object.freeze({
  createBulkCarImageController,
  parseClientFileIds,
  selectBulkUploadStatus
});
