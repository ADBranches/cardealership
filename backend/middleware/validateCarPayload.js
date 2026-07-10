import {
  CAR_REQUIRED_TEXT_FIELDS,
  cleanCarPayload,
  isBlankString,
  validateNumericField,
} from "../utils/cleanPayload.js";

/**
 * Defensive car inventory payload validator.
 *
 * Phase 5 purpose:
 * - Define validation contract.
 * - Identify required fields.
 * - Identify strict numeric fields.
 * - Prepare middleware placement for POST /api/cars.
 *
 * This middleware is not attached to routes in Phase 5.
 * Route attachment happens in the next implementation phase.
 */

export function validateCarPayloadContract(payload = {}) {
  const cleanedPayload = cleanCarPayload(payload);
  const errors = [];

  for (const field of CAR_REQUIRED_TEXT_FIELDS) {
    if (
      cleanedPayload[field] === undefined ||
      cleanedPayload[field] === null ||
      isBlankString(cleanedPayload[field])
    ) {
      errors.push(`${field} is required.`);
    }
  }

  errors.push(
    ...validateNumericField({
      payload: cleanedPayload,
      field: "price",
      min: 1,
      label: "Price",
    })
  );

  errors.push(
    ...validateNumericField({
      payload: cleanedPayload,
      field: "mileage",
      min: 0,
      label: "Mileage",
    })
  );

  errors.push(
    ...validateNumericField({
      payload: cleanedPayload,
      field: "year",
      min: 1900,
      integer: true,
      label: "Year",
    })
  );

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
