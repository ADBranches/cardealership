import {
  getAllCars,
  getCarById,
  createCar
} from "../models/carsModel.js";

// GET ALL CARS
export const fetchCars = async (req, res) => {
  try {
    const cars = await getAllCars();
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET SINGLE CAR
export const fetchCarById = async (req, res) => {
  try {
    const car = await getCarById(req.params.id);
    res.json(car);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE CAR
export const addCar = async (req, res) => {
  try {
    const carId = await createCar(req.body);
    res.status(201).json({
      message: "Car created successfully",
      carId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};