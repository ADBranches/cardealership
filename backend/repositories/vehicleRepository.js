"use strict";

const Vehicle = require("../models/Vehicle");

const createVehicleRepository = (VehicleModel = Vehicle) => Object.freeze({
  findById: async (vehicleId) => VehicleModel.findById(vehicleId).exec()
});

module.exports = Object.freeze({
  ...createVehicleRepository(),
  createVehicleRepository
});
