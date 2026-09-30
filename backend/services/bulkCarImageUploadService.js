import {
  BULK_IMAGE_UPLOAD_ERROR_CODES,
  BULK_IMAGE_UPLOAD_FILE_STATUSES,
  createBulkImageFileResult,
  createBulkImageUploadResponse,
} from "../contracts/bulkImageUpload.contract.js";

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
                error.code ||
                BULK_IMAGE_UPLOAD_ERROR_CODES.STORAGE_FAILED,
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
