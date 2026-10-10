import {
  CAR_REQUIRED_TEXT_FIELDS,
  cleanCarPayload,
  isBlankString,
  isValidFiniteNumber,
  toNumber,
} from "../utils/cleanPayload.js";

/**
 * Defensive car inventory payload validation.
 *
 * POST validates the complete inventory contract.
 * PATCH validates only fields supplied by the administrator.
 */

const VALID_CONDITIONS = new Set(["New", "Used"]);

const VALID_STATUSES = new Set([
  "Available",
  "Pending Test Drive",
  "Reserved",
  "Sold",
]);

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

const PATCH_ALLOWED_FIELDS = new Set([
  "vin",
  "make",
  "model",
  "name",
  "type",
  "category",
  "year",
  "price",
  "mileage",
  "color",
  "condition",
  "status",
  "description",
  "power",
  "engine",
  "drive",
]);

const PATCH_REQUIRED_TEXT_FIELDS = new Set(CAR_REQUIRED_TEXT_FIELDS);

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
    return ["VIN must be exactly 17 characters and cannot contain I, O, or Q."];
  }

  return [];
}

function validateCondition(payload) {
  if (!VALID_CONDITIONS.has(payload.condition)) {
    return ["Condition must be one of: New, Used."];
  }

  return [];
}

function validateStatus(payload) {
  if (!VALID_STATUSES.has(payload.status)) {
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

  if (!isValidFiniteNumber(value) || toNumber(value) <= 0) {
    return [`${label} must be a valid positive number.`];
  }

  return [];
}

function validateNonNegativeNumber(payload, field, label) {
  const value = payload[field];

  if (value === undefined || value === null || isBlankString(value)) {
    return [`${label} is required.`];
  }

  if (!isValidFiniteNumber(value) || toNumber(value) < 0) {
    return [`${label} must be a valid non-negative number.`];
  }

  return [];
}

function validateYear(payload) {
  const value = payload.year;
  const maximumYear = new Date().getFullYear() + 1;

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

  if (numericYear < 1900 || numericYear > maximumYear) {
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

function normalizeVin(payload) {
  if (typeof payload.vin === "string" && payload.vin.trim() !== "") {
    payload.vin = payload.vin.trim().toUpperCase();
  }

  return payload;
}

export function validateCarPayloadContract(payload = {}) {
  const cleanedPayload = normalizeVin(cleanCarPayload(payload));

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

export function validateCarUpdatePayloadContract(payload = {}) {
  const originalFields = Object.keys(payload);

  const unsupportedFields = originalFields.filter(
    (field) => !PATCH_ALLOWED_FIELDS.has(field),
  );

  const cleanedPayload = normalizeVin(cleanCarPayload(payload));

  const errors = [];

  if (originalFields.length === 0) {
    errors.push("At least one vehicle field must be supplied for update.");
  }

  if (unsupportedFields.length > 0) {
    errors.push(
      `Unsupported update field${
        unsupportedFields.length > 1 ? "s" : ""
      }: ${unsupportedFields.join(", ")}.`,
    );
  }

  for (const field of originalFields) {
    if (!PATCH_ALLOWED_FIELDS.has(field)) {
      continue;
    }

    const value = cleanedPayload[field];

    if (PATCH_REQUIRED_TEXT_FIELDS.has(field)) {
      if (value === undefined || value === null || isBlankString(value)) {
        errors.push(`${field} cannot be blank.`);
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
  }

  if ("vin" in cleanedPayload) {
    errors.push(...validateVin(cleanedPayload));
  }

  if ("description" in cleanedPayload) {
    const value = cleanedPayload.description;

    if (value !== null && value !== undefined && typeof value !== "string") {
      errors.push("description must be a valid text value.");
    } else if (typeof value === "string" && hasScriptLikeContent(value)) {
      errors.push("description contains unsupported content.");
    }
  }

  if ("condition" in cleanedPayload) {
    errors.push(...validateCondition(cleanedPayload));
  }

  if ("status" in cleanedPayload) {
    errors.push(...validateStatus(cleanedPayload));
  }

  if ("price" in cleanedPayload) {
    errors.push(...validatePositiveNumber(cleanedPayload, "price", "Price"));
  }

  if ("mileage" in cleanedPayload) {
    errors.push(
      ...validateNonNegativeNumber(cleanedPayload, "mileage", "Mileage"),
    );
  }

  if ("year" in cleanedPayload) {
    errors.push(...validateYear(cleanedPayload));
  }

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

export function validateCarUpdatePayload(req, res, next) {
  const result = validateCarUpdatePayloadContract(req.body || {});

  if (!result.valid) {
    return res.status(400).json({
      success: false,
      message: "Invalid car inventory update.",
      errors: result.errors,
    });
  }

  req.body = result.cleanedPayload;

  return next();
}
