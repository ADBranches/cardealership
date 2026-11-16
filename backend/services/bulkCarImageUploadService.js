import {
  BULK_IMAGE_UPLOAD_ERROR_CODES,
  BULK_IMAGE_UPLOAD_FILE_STATUSES,
  createBulkImageFileResult,
  createBulkImageUploadResponse,
} from "../contracts/bulkImageUpload.contract.js";
import config from '../config/bulkImageUpload.js';
import { createImageUploadValidator } from '../utils/validateImageUpload.js';

const validateFile = createImageUploadValidator(config);

const requiredMethod = (value, methodName, label) => {
  if (!value || typeof value[methodName] !== "function") {
    throw new TypeError(
      `${label} must implement ${methodName}.`,
    );
  }

  return value;
};

const createClientFileId = (file, index) =>
  String(
    file.clientFileId ||
      `${index + 1}:${file.originalname}`,
  );

export const createBulkCarImageUploadService = (
  {
    carRepository,
    imageRepository,
    storage,
  },
) => {
  requiredMethod(
    carRepository,
    "findById",
    "Car repository",
  );
  requiredMethod(
    imageRepository,
    "create",
    "Image repository",
  );
  requiredMethod(storage, "upload", "Image storage");
  requiredMethod(storage, "remove", "Image storage");

  const uploadFiles = async ({ carId, files }) => {
    if (!Array.isArray(files) || !files.length) {
      throw Object.assign(new Error('At least one image file is required.'), { code: BULK_IMAGE_UPLOAD_ERROR_CODES.FILE_REQUIRED });
    }
    const car = await carRepository.findById(carId);

    if (!car) {
      throw Object.assign(
        new Error("The requested vehicle was not found."),
        {
          code: BULK_IMAGE_UPLOAD_ERROR_CODES.CAR_NOT_FOUND,
        },
      );
    }

    const fileResults = [];

    for (const [index, file] of files.entries()) {
      const clientFileId = createClientFileId(
        file,
        index,
      );
      let storedImage = null;

      try {
        validateFile(file);
      } catch (error) {
        fileResults.push(createBulkImageFileResult({ clientFileId, fileName: file.originalname, status: BULK_IMAGE_UPLOAD_FILE_STATUSES.REJECTED, mimeType: file.mimetype, size: file.size, error: { code: error.code, message: error.message } }));
        continue;
      }

      try {
        storedImage = await storage.upload({
          carId,
          file,
        });

        const image = await imageRepository.create({
          carId,
          url: storedImage.url,
          publicId: storedImage.publicId,
          fileName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          displayOrder: index,
        });

        fileResults.push(
          createBulkImageFileResult({
            clientFileId,
            fileName: file.originalname,
            status:
              BULK_IMAGE_UPLOAD_FILE_STATUSES.UPLOADED,
            mimeType: file.mimetype,
            size: file.size,
            imageId: image.id,
            url: image.url || storedImage.url,
          }),
        );
      } catch (error) {
        if (storedImage?.publicId) {
          try {
            await storage.remove(storedImage.publicId);
          } catch {
            // Preserve the original file-scoped failure.
          }
        }

        fileResults.push(
          createBulkImageFileResult({
            clientFileId,
            fileName: file.originalname,
            status:
              BULK_IMAGE_UPLOAD_FILE_STATUSES.FAILED,
            mimeType: file.mimetype,
            size: file.size,
            error: {
              code:
                storedImage ? BULK_IMAGE_UPLOAD_ERROR_CODES.PERSISTENCE_FAILED : (error.code || BULK_IMAGE_UPLOAD_ERROR_CODES.STORAGE_FAILED),
              message:
                error.message ||
                "The image could not be uploaded.",
            },
          }),
        );
      }
    }

    return createBulkImageUploadResponse({
      carId,
      files: fileResults,
    });
  };

  return Object.freeze({
    uploadFiles,
  });
};
