import { getAllCars, getCarById, createCar } from "../models/carsModel.js";

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

/*
|--------------------------------------------------------------------------
| GET ALL CARS
|--------------------------------------------------------------------------
|
| GET /api/cars
|
*/

export async function fetchCars(req, res) {
  try {
    const cars = await getAllCars();

    return res.status(200).json({
      success: true,
      count: cars.length,
      cars,
    });
  } catch (error) {
    console.error("Fetch cars failed:", error);

    return sendError(
      res,
      500,
      "FETCH_CARS_FAILED",
      "Unable to load vehicle inventory.",
      {
        reason: error.message,
      },
    );
  }
}

/*
|--------------------------------------------------------------------------
| GET SINGLE CAR
|--------------------------------------------------------------------------
|
| GET /api/cars/:id
|
*/

export async function fetchCarById(req, res) {
  try {
    const carId = Number(req.params.id);

    if (!Number.isInteger(carId) || carId <= 0) {
      return sendError(
        res,
        400,
        "INVALID_CAR_ID",
        "A valid car ID is required.",
      );
    }

    const result = await getCarById(carId);

    if (!result.car) {
      return sendError(
        res,
        404,
        "CAR_NOT_FOUND",
        "The requested vehicle was not found.",
      );
    }

    return res.status(200).json({
      success: true,
      car: {
        ...result.car,
        images: result.images,
      },
    });
  } catch (error) {
    console.error("Fetch car by ID failed:", error);

    return sendError(
      res,
      500,
      "FETCH_CAR_FAILED",
      "Unable to load the selected vehicle.",
      {
        reason: error.message,
      },
    );
  }
}

/*
|--------------------------------------------------------------------------
| CREATE CAR
|--------------------------------------------------------------------------
|
| POST /api/cars
|
*/

export async function addCar(req, res) {
  try {
    const {
      vin,
      make,
      model,
      name,
      type,
      category,
      year,
      price,
      mileage,
      color,
      condition,
      status,
      description,
      power,
      engine,
      drive,
      images = [],
    } = req.body;

    const carId = await createCar({
      vin,
      make,
      model,
      name,
      type,
      category,
      year,
      price,
      mileage,
      color,
      condition,
      status,
      description,
      power,
      engine,
      drive,
      images,
    });

    return res.status(201).json({
      success: true,
      message: "Vehicle created successfully.",
      car: {
        id: carId,
      },
    });
  } catch (error) {
    console.error("Create car failed:", error);

    return sendError(
      res,
      500,
      "CREATE_CAR_FAILED",
      "Unable to create the vehicle.",
      {
        reason: error.message,
      },
    );
  }
}
