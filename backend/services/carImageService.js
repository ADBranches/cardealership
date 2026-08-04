import cloudinary from "../config/cloudinary.js";
import { saveCarImage } from "../models/carsModel.js";
import {
  buildCloudinaryOptimizedUploadOptions,
  getImageOptimizationConfig,
} from "../utils/imageOptimization.js";

/**
 * Upload image to Cloudinary + save DB record
 */
export const uploadCarImageService = async ({
  fileBuffer,
  carId,
  imageType,
}) => {
  const optimization = getImageOptimizationConfig();
  const uploadOptions = buildCloudinaryOptimizedUploadOptions({
    folder: "car-images",
  });

  // 1. Upload optimized image to Cloudinary
  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    stream.end(fileBuffer);
  });

  // 2. Save in DB via model
  const dbImage = await saveCarImage(
    carId,
    uploadResult.secure_url,
    imageType || "general",
  );

  return {
    ...dbImage,
    optimization: {
      format: uploadResult.format,
      width: uploadResult.width,
      height: uploadResult.height,
      bytes: uploadResult.bytes,
      maxWidth: optimization.maxWidth,
      maxHeight: optimization.maxHeight,
      quality: optimization.quality,
    },
  };
};
