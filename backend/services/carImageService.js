import cloudinary from "../config/cloudinary.js";
import { saveCarImage } from "../models/carsModel.js";

/**
 * Upload image to Cloudinary + save DB record
 */
export const uploadCarImageService = async ({
  fileBuffer,
  carId,
  imageType,
}) => {
  // 1. Upload to Cloudinary
  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "car-images",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(fileBuffer);
  });

  // 2. Save in DB via model
  const dbImage = await saveCarImage(
    carId,
    uploadResult.secure_url,
    imageType || "general"
  );

  return dbImage;
};