"use strict";

const mongoose = require("mongoose");

const USER_ROLES = Object.freeze({
  CUSTOMER: "customer",
  ADMINISTRATOR: "administrator"
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: Object.values(USER_ROLES),
    default: USER_ROLES.CUSTOMER,
    required: true
  }
}, {
  timestamps: true
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
module.exports.USER_ROLES = USER_ROLES;
