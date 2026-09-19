const parsePositiveInteger = (value, fallback) => {
  const parsedValue = Number.parseInt(value, 10);

  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
};

const parseList = (value, fallback) =>
  Object.freeze(
    (value || fallback)
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );

export const bulkImageUploadConfig = Object.freeze({
  fieldName:
    process.env.BULK_IMAGE_UPLOAD_FIELD_NAME || "images",
  maxFiles: parsePositiveInteger(
    process.env.BULK_IMAGE_UPLOAD_MAX_FILES,
    10,
  ),
  maxFileSizeBytes: parsePositiveInteger(
    process.env.BULK_IMAGE_UPLOAD_MAX_FILE_SIZE_BYTES,
    5242880,
  ),
  allowedMimeTypes: parseList(
    process.env.BULK_IMAGE_UPLOAD_ALLOWED_MIME_TYPES,
    "image/jpeg,image/png,image/webp",
  ),
  allowedExtensions: parseList(
    process.env.BULK_IMAGE_UPLOAD_ALLOWED_EXTENSIONS,
    ".jpg,.jpeg,.png,.webp",
  ),
});

export default bulkImageUploadConfig;
