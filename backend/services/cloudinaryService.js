import cloudinary from "../config/cloudinary.js";
import { buildCloudinaryOptimizedUploadOptions } from "../utils/optimizeCarImage.js";

/**
 * Uploads a car image to Cloudinary using the shared optimization preset.
 */
export async function uploadImage(fileBuffer, { folder = "car-images" } = {}) {
  const uploadOptions = buildCloudinaryOptimizedUploadOptions({ folder });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        return resolve(result);
      },
    );

    stream.end(fileBuffer);
  });
}

export default {
  uploadImage,
};
