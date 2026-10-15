"use strict";

const {
  BULK_IMAGE_UPLOAD_FILE_STATUSES,
  BULK_IMAGE_UPLOAD_ERROR_CODES,
  createBulkImageFileResult,
  createBulkImageUploadResponse
} = require("../contracts/bulkImageUpload.contract");

const assertDependency = (dependency, methodName, dependencyName) => {
  if (!dependency || typeof dependency[methodName] !== "function") {
    throw new TypeError(`${dependencyName} must implement ${methodName}.`);
  }
};

const createRejectedResult = (file) => createBulkImageFileResult({
  clientFileId: file.clientFileId,
  fileName: file.originalname || file.fileName,
  status: BULK_IMAGE_UPLOAD_FILE_STATUSES.REJECTED,
  mimeType: file.mimetype || file.mimeType,
  size: file.size,
  error: {
    code: file.validationError.code,
    message: file.validationError.message
  }
});

const createFailedResult = (file, code, message) => createBulkImageFileResult({
  clientFileId: file.clientFileId,
  fileName: file.originalname || file.fileName,
  status: BULK_IMAGE_UPLOAD_FILE_STATUSES.FAILED,
  mimeType: file.mimetype || file.mimeType,
  size: file.size,
  error: { code, message }
});

const createBulkCarImageUploadService = (dependencies) => {
  const vehicleRepository = dependencies && dependencies.vehicleRepository;
  const imageStorage = dependencies && dependencies.imageStorage;
  const imageRepository = dependencies && dependencies.imageRepository;

  assertDependency(vehicleRepository, "findById", "Vehicle repository");
  assertDependency(imageStorage, "store", "Image storage");
  assertDependency(imageStorage, "remove", "Image storage");
  assertDependency(imageRepository, "save", "Image repository");

  const processFile = async (vehicle, file) => {
    if (file.validationError) {
      return createRejectedResult(file);
    }

    let storedImage = null;

    try {
      storedImage = await imageStorage.store({
        vehicleId: String(vehicle.id || vehicle._id),
        clientFileId: file.clientFileId,
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        buffer: file.buffer
      });
    } catch (storageError) {
      return createFailedResult(
        file,
        BULK_IMAGE_UPLOAD_ERROR_CODES.STORAGE_FAILED,
        "The image could not be stored."
      );
    }

    try {
      const persistedImage = await imageRepository.save({
        vehicleId: String(vehicle.id || vehicle._id),
        clientFileId: file.clientFileId,
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storageKey: storedImage.storageKey,
        url: storedImage.url
      });

      return createBulkImageFileResult({
        clientFileId: file.clientFileId,
        fileName: file.originalname,
        status: BULK_IMAGE_UPLOAD_FILE_STATUSES.UPLOADED,
        mimeType: file.mimetype,
        size: file.size,
        imageId: String(persistedImage.id || persistedImage._id),
        url: persistedImage.url || storedImage.url
      });
    } catch (persistenceError) {
      try {
        await imageStorage.remove(storedImage.storageKey);
      } catch (cleanupError) {
        persistenceError.cleanupError = cleanupError;
      }

      return createFailedResult(
        file,
        BULK_IMAGE_UPLOAD_ERROR_CODES.PERSISTENCE_FAILED,
        "The stored image could not be associated with the vehicle."
      );
    }
  };

  const processBulkUpload = async ({ vehicleId, files }) => {
    const vehicle = await vehicleRepository.findById(vehicleId);

    if (!vehicle) {
      const error = new Error("The target vehicle was not found.");
      error.code = BULK_IMAGE_UPLOAD_ERROR_CODES.CAR_NOT_FOUND;
      throw error;
    }

    if (!Array.isArray(files) || files.length === 0) {
      const error = new Error("At least one image file is required.");
      error.code = BULK_IMAGE_UPLOAD_ERROR_CODES.FILE_REQUIRED;
      throw error;
    }

    const fileResults = [];

    for (const file of files) {
      fileResults.push(await processFile(vehicle, file));
    }

    return createBulkImageUploadResponse({
      carId: String(vehicle.id || vehicle._id),
      files: fileResults
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
    processBulkUpload
  });
};

module.exports = Object.freeze({
  createBulkCarImageUploadService
});
    uploadFiles,
  });
};
