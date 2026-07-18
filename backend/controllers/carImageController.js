import { uploadCarImageService } from "../services/carImageService.js";

export const uploadCarImage = async (req, res) => {
  try {
    const { carId, imageType } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    if (!carId) {
      return res.status(400).json({ message: "carId is required" });
    }

    const result = await uploadCarImageService({
      fileBuffer: req.file.buffer,
      carId,
      imageType,
    });

    res.status(201).json({
      message: "Image uploaded successfully",
      image: result,
    });
  } catch (err) {
    res.status(500).json({
      message: "Upload failed",
      error: err.message,
    });
  }
};