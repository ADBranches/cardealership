import {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
} from "../models/carsModel.js";

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

function parseCarId(value) {
  const carId = Number(value);

  if (!Number.isInteger(carId) || carId <= 0) {
    return null;
  }

  return carId;
}

// GET ALL CARS

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

// GET SINGLE CAR

export async function fetchCarById(req, res) {
  try {
    const carId = parseCarId(req.params.id);

    if (!carId) {
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

// CREATE CAR

export async function addCar(req, res) {
  try {
    const carId = await createCar(req.body);

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

// UPDATE CAR

export async function editCar(req, res) {
  try {
    const carId = parseCarId(req.params.id);

    if (!carId) {
      return sendError(
        res,
        400,
        "INVALID_CAR_ID",
        "A valid car ID is required.",
      );
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return sendError(
        res,
        400,
        "EMPTY_UPDATE",
        "At least one vehicle field must be provided.",
      );
    }

    const result = await updateCar(carId, req.body);

    if (!result) {
      return sendError(
        res,
        404,
        "CAR_NOT_FOUND",
        "The vehicle to update was not found.",
      );
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully.",
      car: {
        ...result.car,
        images: result.images,
      },
    });
  } catch (error) {
    console.error("Update car failed:", error);

    return sendError(
      res,
      500,
      "UPDATE_CAR_FAILED",
      "Unable to update the vehicle.",
      {
        reason: error.message,
      },
    );
  }
}

// DELETE CAR

export async function removeCar(req, res) {
  try {
    const carId = parseCarId(req.params.id);

    if (!carId) {
      return sendError(
        res,
        400,
        "INVALID_CAR_ID",
        "A valid car ID is required.",
      );
    }

    const deletedCar = await deleteCar(carId);

    if (!deletedCar) {
      return sendError(
        res,
        404,
        "CAR_NOT_FOUND",
        "The vehicle to delete was not found.",
      );
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully.",
      car: deletedCar,
    });
  } catch (error) {
    console.error("Delete car failed:", error);

    return sendError(
      res,
      500,
      "DELETE_CAR_FAILED",
      "Unable to delete the vehicle.",
      {
        reason: error.message,
      },
    );
  }
}
