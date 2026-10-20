export const BULK_IMAGE_UPLOAD_FIELD_NAME = "images";

export const BULK_IMAGE_UPLOAD_FILE_STATUSES =
  Object.freeze({
    ACCEPTED: "accepted",
    UPLOADED: "uploaded",
    REJECTED: "rejected",
    FAILED: "failed",
  });

export const BULK_IMAGE_UPLOAD_ERROR_CODES =
  Object.freeze({
    CAR_NOT_FOUND: "CAR_NOT_FOUND",
    FILE_REQUIRED: "FILE_REQUIRED",
    TOO_MANY_FILES: "TOO_MANY_FILES",
    FILE_TOO_LARGE: "FILE_TOO_LARGE",
    UNEXPECTED_FIELD: "UNEXPECTED_FIELD",
    UNSUPPORTED_MIME_TYPE: "UNSUPPORTED_MIME_TYPE",
    UNSUPPORTED_EXTENSION: "UNSUPPORTED_EXTENSION",
    STORAGE_FAILED: "STORAGE_FAILED",
    PERSISTENCE_FAILED: "PERSISTENCE_FAILED",
  });

export const BULK_IMAGE_UPLOAD_HTTP_STATUSES =
  Object.freeze({
    COMPLETE_SUCCESS: 201,
    PARTIAL_SUCCESS: 207,
    COMPLETE_REJECTION: 422,
    REQUEST_REJECTED: 400,
    VEHICLE_NOT_FOUND: 404,
    SERVER_FAILURE: 500,
  });

export const createBulkImageFileResult = (
  {
    clientFileId,
    fileName,
    status,
    mimeType,
    size,
    imageId = null,
    url = null,
    error = null,
  },
) =>
  Object.freeze({
    clientFileId,
    fileName,
    status,
    mimeType,
    size,
    imageId,
    url,
    error: error ? Object.freeze({ ...error }) : null,
  });

export const createBulkImageUploadResponse = (
  { carId, files },
) => {
  const immutableFiles = Object.freeze(
    files.map((file) => Object.freeze({ ...file })),
  );

  const summary = immutableFiles.reduce(
    (counts, file) => {
      counts.received += 1;

      if (
        file.status ===
        BULK_IMAGE_UPLOAD_FILE_STATUSES.UPLOADED
      ) {
        counts.uploaded += 1;
      }

      if (
        file.status ===
        BULK_IMAGE_UPLOAD_FILE_STATUSES.REJECTED
      ) {
        counts.rejected += 1;
      }

      if (
        file.status ===
        BULK_IMAGE_UPLOAD_FILE_STATUSES.FAILED
      ) {
        counts.failed += 1;
      }

      return counts;
    },
    {
      received: 0,
      uploaded: 0,
      rejected: 0,
      failed: 0,
    },
  );

  return Object.freeze({
    carId,
    summary: Object.freeze(summary),
    files: immutableFiles,
  });
};
