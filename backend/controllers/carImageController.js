import { uploadCarImageService } from "../services/carImageService.js";

function sendError(res, status, code, message, details = null) {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
      status,
      details,
    },
  });
}

export const uploadCarImage = async (req, res) => {
  try {
    const { carId, imageType } = req.body;

    if (!req.file) {
      return sendError(
        res,
        400,
        "MISSING_IMAGE_FILE",
        "No image file was uploaded.",
      );
    }

    if (!carId) {
      return sendError(res, 400, "CAR_ID_REQUIRED", "carId is required.");
    }

    const result = await uploadCarImageService({
      fileBuffer: req.file.buffer,
      carId,
      imageType,
    });

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      image: result,
    });
  } catch (err) {
    return sendError(res, 500, "IMAGE_UPLOAD_FAILED", "Image upload failed.", {
      reason: err.message,
    });
  }
};
