import {
  CAR_REQUIRED_TEXT_FIELDS,
  cleanCarPayload,
  isBlankString,
  isValidFiniteNumber,
  toNumber,
} from "../utils/cleanPayload.js";

/**
 * Defensive car inventory payload validator.
 *
 * Validates the complete inventory contract before the controller/model
 * receives the vehicle data.
 */

const VALID_CONDITIONS = new Set(["New", "Used"]);

const VALID_STATUSES = new Set([
  "Available",
  "Pending Test Drive",
  "Reserved",
  "Sold",
]);

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

function hasScriptLikeContent(value) {
  if (typeof value !== "string") {
    return false;
  }

  return /<script|<\/script|javascript:/i.test(value);
}

function validateRequiredTextFields(payload) {
  const errors = [];

  for (const field of CAR_REQUIRED_TEXT_FIELDS) {
    const value = payload[field];

    if (value === undefined || value === null || isBlankString(value)) {
      errors.push(`${field} is required.`);
      continue;
    }

    if (typeof value !== "string") {
      errors.push(`${field} must be a valid text value.`);
      continue;
    }

    if (hasScriptLikeContent(value)) {
      errors.push(`${field} contains unsupported content.`);
    }
  }

  return errors;
}

function validateVin(payload) {
  const value = payload.vin;

  if (value === undefined || value === null || isBlankString(value)) {
    return ["VIN is required."];
  }

  if (typeof value !== "string") {
    return ["VIN must be a valid text value."];
  }

  const normalizedVin = value.toUpperCase();

  if (!VIN_PATTERN.test(normalizedVin)) {
    return [
      "VIN must be exactly 17 characters and cannot contain I, O, or Q.",
    ];
  }

  return [];
}

function validateCondition(payload) {
  const value = payload.condition;

  if (!VALID_CONDITIONS.has(value)) {
    return [
      "Condition must be one of: New, Used.",
    ];
  }

  return [];
}

function validateStatus(payload) {
  const value = payload.status;

  if (!VALID_STATUSES.has(value)) {
    return [
      "Status must be one of: Available, Pending Test Drive, Reserved, Sold.",
    ];
  }

  return [];
}

function validatePositiveNumber(payload, field, label) {
  const value = payload[field];

  if (value === undefined || value === null || isBlankString(value)) {
    return [`${label} is required.`];
  }

  if (!isValidFiniteNumber(value)) {
    return [`${label} must be a valid positive number.`];
  }

  if (toNumber(value) <= 0) {
    return [`${label} must be a valid positive number.`];
  }

  return [];
}

function validateNonNegativeNumber(payload, field, label) {
  const value = payload[field];

  if (value === undefined || value === null || isBlankString(value)) {
    return [`${label} is required.`];
  }

  if (!isValidFiniteNumber(value)) {
    return [`${label} must be a valid non-negative number.`];
  }

  if (toNumber(value) < 0) {
    return [`${label} must be a valid non-negative number.`];
  }

  return [];
}

function validateYear(payload) {
  const value = payload.year;
  const currentYear = new Date().getFullYear() + 1;

  if (value === undefined || value === null || isBlankString(value)) {
    return ["Year is required."];
  }

  if (!isValidFiniteNumber(value)) {
    return ["Year must be valid."];
  }

  const numericYear = toNumber(value);

  if (!Number.isInteger(numericYear)) {
    return ["Year must be a whole number."];
  }

  if (numericYear < 1900 || numericYear > currentYear) {
    return ["Year must be valid."];
  }

  return [];
}

function validateImages(payload) {
  const errors = [];

  if (payload.images === undefined || payload.images === null) {
    return errors;
  }

  if (!Array.isArray(payload.images)) {
    return ["Images must be submitted as an array of image URLs."];
  }

  for (const image of payload.images) {
    if (typeof image !== "string" || image.trim() === "") {
      errors.push("Each image must be a valid image URL string.");
      continue;
    }

    if (hasScriptLikeContent(image)) {
      errors.push("Image URLs contain unsupported content.");
    }
  }

  return errors;
}

function validateOptionalTextFields(payload) {
  const errors = [];

  for (const field of ["vin", "description"]) {
    const value = payload[field];

    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value !== "string") {
      errors.push(`${field} must be a valid text value.`);
      continue;
    }

    if (hasScriptLikeContent(value)) {
      errors.push(`${field} contains unsupported content.`);
    }
  }

  return errors;
}

export function validateCarPayloadContract(payload = {}) {
  const cleanedPayload = cleanCarPayload(payload);

  const errors = [
    ...validateRequiredTextFields(cleanedPayload),
    ...validateOptionalTextFields(cleanedPayload),
    ...validateVin(cleanedPayload),
    ...validateCondition(cleanedPayload),
    ...validateStatus(cleanedPayload),
    ...validatePositiveNumber(cleanedPayload, "price", "Price"),
    ...validateNonNegativeNumber(cleanedPayload, "mileage", "Mileage"),
    ...validateYear(cleanedPayload),
    ...validateImages(cleanedPayload),
  ];

  return {
    valid: errors.length === 0,
    errors,
    cleanedPayload,
  };
}

export function validateCarPayload(req, res, next) {
  const result = validateCarPayloadContract(req.body || {});

  if (!result.valid) {
    return res.status(400).json({
      success: false,
      message: "Invalid car inventory payload.",
      errors: result.errors,
    });
  }

  req.body = result.cleanedPayload;

  return next();
}
