"use strict";

const mongoose = require("mongoose");

const vehicleImageSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true,
    index: true
  },
  clientFileId: { type: String, required: true, trim: true },
  fileName: { type: String, required: true, trim: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true, min: 1 },
  storageKey: { type: String, required: true, unique: true },
  url: { type: String, required: true }
}, {
  timestamps: true
});

vehicleImageSchema.index({
  vehicleId: 1,
  clientFileId: 1
}, {
  unique: true,
  name: "vehicle_client_file_unique"
});

const VehicleImage = mongoose.models.VehicleImage || mongoose.model("VehicleImage", vehicleImageSchema);

module.exports = VehicleImage;
