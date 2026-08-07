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
 * Purpose:
 * Reject malicious, missing, or badly typed car inventory submissions before
 * controller/model/database logic runs.
 */

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
    return ["Year must be valid."];
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

export function validateCarPayloadContract(payload = {}) {
  const cleanedPayload = cleanCarPayload(payload);
  const errors = [
    ...validateRequiredTextFields(cleanedPayload),
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
