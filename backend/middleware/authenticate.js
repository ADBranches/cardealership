"use strict";

const jwt = require("jsonwebtoken");

const AUTHENTICATION_ERROR_CODES = Object.freeze({
  TOKEN_REQUIRED: "AUTH_TOKEN_REQUIRED",
  TOKEN_INVALID: "AUTH_TOKEN_INVALID",
  TOKEN_CONFIGURATION_INVALID: "AUTH_TOKEN_CONFIGURATION_INVALID"
});

const createAuthenticationMiddleware = (options = {}) => {
  const verifyToken = options.verifyToken || jwt.verify;
  const secret = options.secret || process.env.JWT_SECRET;

  return (request, response, next) => {
    const authorizationHeader = request.headers && request.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      return response.status(401).json({
        success: false,
        error: {
          code: AUTHENTICATION_ERROR_CODES.TOKEN_REQUIRED,
          message: "A bearer authentication token is required."
        }
      });
    }

    if (!secret) {
      return response.status(500).json({
        success: false,
        error: {
          code: AUTHENTICATION_ERROR_CODES.TOKEN_CONFIGURATION_INVALID,
          message: "Authentication is not configured."
        }
      });
    }

    const token = authorizationHeader.slice("Bearer ".length).trim();

    try {
      const payload = verifyToken(token, secret);
      request.user = Object.freeze({
        id: String(payload.id || payload.sub),
        email: payload.email,
        role: payload.role
      });
      return next();
    } catch (error) {
      return response.status(401).json({
        success: false,
        error: {
          code: AUTHENTICATION_ERROR_CODES.TOKEN_INVALID,
          message: "The authentication token is invalid or expired."
        }
      });
    }
  };
};

module.exports = Object.freeze({
  AUTHENTICATION_ERROR_CODES,
  createAuthenticationMiddleware
});
