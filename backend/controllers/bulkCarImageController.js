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
import {
  BULK_IMAGE_UPLOAD_ERROR_CODES,
  BULK_IMAGE_UPLOAD_HTTP_STATUSES,
} from "../contracts/bulkImageUpload.contract.js";
import {
  carLookupRepository,
  carImageRepository,
} from "../repositories/bulkCarImageRepository.js";
import {
  createBulkCarImageUploadService,
} from "../services/bulkCarImageUploadService.js";
import {
  createBulkImageStorage,
} from "../services/bulkImageStorage.js";

export const parseClientFileIds = (request, fileCount) => {
  const rawValue = request.body?.clientFileIds;
  let values = [];

  if (Array.isArray(rawValue)) {
    values = rawValue;
  } else if (typeof rawValue === "string" && rawValue.trim()) {
    try {
      const parsedValue = JSON.parse(rawValue);
      values = Array.isArray(parsedValue)
        ? parsedValue
        : rawValue.split(",");
    } catch {
      values = rawValue.split(",");
    }
  }

  if (values.length !== fileCount) {
    throw Object.assign(
      new Error("Every file must have one clientFileId."),
      { code: BULK_IMAGE_UPLOAD_ERROR_CODES.FILE_REQUIRED },
    );
  }

  const normalizedValues = values.map((value) =>
    String(value).trim(),
  );

  if (
    normalizedValues.some((value) => !value) ||
    new Set(normalizedValues).size !== normalizedValues.length
  ) {
    throw Object.assign(
      new Error(
        "clientFileId values must be non-empty and unique.",
      ),
      { code: BULK_IMAGE_UPLOAD_ERROR_CODES.FILE_REQUIRED },
    );
  }

  return normalizedValues;
};

export const selectBulkUploadStatus = (summary) => {
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
export const createBulkCarImageController = (service) => {
  if (!service || typeof service.uploadFiles !== "function") {
    throw new TypeError(
      "Bulk image-upload service must implement uploadFiles.",
    );
  }

  return Object.freeze({
    async uploadBulkImages(request, response) {
      try {
        const clientFileIds = parseClientFileIds(
          request,
          request.files.length,
        );

        const files = request.files.map((file, index) =>
          Object.freeze({
            ...file,
            clientFileId: clientFileIds[index],
          }),
        );

        const result = await service.uploadFiles({
          carId: Number(request.params.id),
          files,
        });

        return response
          .status(selectBulkUploadStatus(result.summary))
          .json({
            success: result.summary.uploaded > 0,
            ...result,
          });
      } catch (error) {
        if (
          error.code ===
          BULK_IMAGE_UPLOAD_ERROR_CODES.CAR_NOT_FOUND
        ) {
          return response.status(404).json({
            success: false,
            error: {
              code: error.code,
              message: "The target vehicle was not found.",
            },
          });
        }

        if (
          error.code ===
          BULK_IMAGE_UPLOAD_ERROR_CODES.FILE_REQUIRED
        ) {
          return response.status(400).json({
            success: false,
            error: {
              code: error.code,
              message: error.message,
            },
          });
        }

        return response.status(500).json({
          success: false,
          error: {
            code:
              error.code ||
              "BULK_IMAGE_UPLOAD_SERVER_FAILURE",
            message:
              "The bulk image-upload request could not be completed.",
          },
        });
      }
    },
  });
};

const bulkImageService = createBulkCarImageUploadService({
  carRepository: carLookupRepository,
  imageRepository: carImageRepository,
  storage: createBulkImageStorage(),
});

export const bulkCarImageController =
  createBulkCarImageController(bulkImageService);
