import { uploadImage } from "../services/cloudinaryService.js";
import { createCarImage } from "../models/carImagesModel.js";

import { createCarImage } from "../models/uploadModel";

export const uploadCarImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const { carId, imageType } = req.body;

    const result = await uploadImage(req.file.buffer);

    const saved = await createCarImage(
      carId,
      result.secure_url,
      imageType
    );

    res.status(201).json({
      message: "Image uploaded successfully",
      image: saved.rows[0],
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};