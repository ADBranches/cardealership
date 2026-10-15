"use strict";

const VehicleImage = require("../models/VehicleImage");

const createVehicleImageRepository = (VehicleImageModel = VehicleImage) => Object.freeze({
  save: async (metadata) => VehicleImageModel.create(metadata)
});

module.exports = Object.freeze({
  ...createVehicleImageRepository(),
  createVehicleImageRepository
});
