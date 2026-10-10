"use strict";

const { USER_ROLES } = require("../models/User");

const AUTHORIZATION_ERROR_CODES = Object.freeze({
  AUTHENTICATION_REQUIRED: "AUTHENTICATION_REQUIRED",
  ADMINISTRATOR_REQUIRED: "ADMINISTRATOR_REQUIRED"
});

const authorizeAdministrator = (request, response, next) => {
  if (!request.user) {
    return response.status(401).json({
      success: false,
      error: {
        code: AUTHORIZATION_ERROR_CODES.AUTHENTICATION_REQUIRED,
        message: "Authentication is required."
      }
    });
  }

  if (request.user.role !== USER_ROLES.ADMINISTRATOR) {
    return response.status(403).json({
      success: false,
      error: {
        code: AUTHORIZATION_ERROR_CODES.ADMINISTRATOR_REQUIRED,
        message: "Administrator authorization is required."
      }
    });
  }

  return next();
};

module.exports = Object.freeze({
  AUTHORIZATION_ERROR_CODES,
  authorizeAdministrator
});
