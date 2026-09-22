import {
  getCarById,
  saveCarImage,
} from "../models/carsModel.js";

export const carLookupRepository = Object.freeze({
  async findById(carId) {
    const normalizedCarId = Number(carId);

    if (
      !Number.isInteger(normalizedCarId) ||
      normalizedCarId <= 0
    ) {
      return null;
    }

    const result = await getCarById(normalizedCarId);
    return result?.car || null;
  },
});

export const carImageRepository = Object.freeze({
  async create({
    carId,
    url,
    displayOrder = 0,
  }) {
    const normalizedCarId = Number(carId);
    const imageType =
      Number(displayOrder) === 0
        ? "primary"
        : "general";

    const image = await saveCarImage(
      normalizedCarId,
      url,
      imageType,
    );

    return Object.freeze({
      id: image.id,
      carId: image.car_id,
      url: image.image_url,
      imageType: image.image_type,
    });
  },
});
