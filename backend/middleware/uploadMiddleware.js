import multer from "multer";

// store file in memory (not on disk)
const storage = multer.memoryStorage();
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;
const INVALID_IMAGE_TYPE_MESSAGE = "Only image files are allowed.";

function buildUploadError({ status, code, message, details }) {
  return {
    success: false,
    error: {
      code,
      message,
      status,
      details: details || null,
    },
  };
}

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES, // 15MB (covers 10MB smartphone photos)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      const typeError = new Error(INVALID_IMAGE_TYPE_MESSAGE);
      typeError.code = "INVALID_IMAGE_TYPE";
      return cb(typeError, false);
    }

    cb(null, true);
  },
});

export const uploadSingleCarImage = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (
      error instanceof multer.MulterError &&
      error.code === "LIMIT_FILE_SIZE"
    ) {
      return res.status(413).json(
        buildUploadError({
          status: 413,
          code: "PAYLOAD_TOO_LARGE",
          message: "Uploaded image exceeds the 15MB limit.",
          details: {
            maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
          },
        }),
      );
    }

    if (error.code === "INVALID_IMAGE_TYPE") {
      return res.status(415).json(
        buildUploadError({
          status: 415,
          code: "UNSUPPORTED_MEDIA_TYPE",
          message:
            "Only image uploads are supported (jpeg, png, webp, heic, heif).",
          details: {
            receivedMimeType:
              req.file?.mimetype || req.headers["content-type"] || null,
          },
        }),
      );
    }

    return res.status(400).json(
      buildUploadError({
        status: 400,
        code: "UPLOAD_VALIDATION_FAILED",
        message: error.message || "Image upload validation failed.",
      }),
    );
  });
};

export default upload;
