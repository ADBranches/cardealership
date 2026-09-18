"use strict";

const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  make: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true },
  year: { type: Number, required: true, min: 1886 },
  status: {
    type: String,
    enum: ["draft", "available", "sold", "archived"],
    default: "draft"
  }
}, {
  timestamps: true
});

const Vehicle = mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);

module.exports = Vehicle;
