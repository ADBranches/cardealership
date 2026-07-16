export const CAR_REQUIRED_TEXT_FIELDS = [
  "name",
  "brand",
  "type",
  "category",
];

export const CAR_OPTIONAL_TEXT_FIELDS = [
  "make",
  "model",
  "power",
  "engine",
  "drive",
  "status",
];

export const CAR_NUMERIC_FIELDS = [
  "year",
  "price",
  "mileage",
];

export function trimStringValue(value) {
  if (typeof value !== "string") {
    return value;
  }

  return value.trim();
}

export function cleanCarPayload(payload = {}) {
  const cleaned = { ...payload };

  for (const field of [...CAR_REQUIRED_TEXT_FIELDS, ...CAR_OPTIONAL_TEXT_FIELDS]) {
    if (field in cleaned) {
      cleaned[field] = trimStringValue(cleaned[field]);
    }
  }

  return cleaned;
}

export function isBlankString(value) {
  return typeof value === "string" && value.trim() === "";
}

export function isValidFiniteNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (typeof value !== "string") {
    return false;
  }

  if (value.trim() === "") {
    return false;
  }

  return Number.isFinite(Number(value));
}

export function toNumber(value) {
  if (typeof value === "number") {
    return value;
  }

  return Number(value);
}

export function validateNumericField({
  payload,
  field,
  min,
  integer = false,
  label,
}) {
  const errors = [];
  const rawValue = payload[field];

  if (rawValue === undefined || rawValue === null || isBlankString(rawValue)) {
    errors.push(`${label} is required.`);
    return errors;
  }

  if (!isValidFiniteNumber(rawValue)) {
    errors.push(`${label} must be a valid number.`);
    return errors;
  }

  const numericValue = toNumber(rawValue);

  if (integer && !Number.isInteger(numericValue)) {
    errors.push(`${label} must be a whole number.`);
  }

  if (numericValue < min) {
    errors.push(`${label} must be ${min === 0 ? "zero or greater" : `at least ${min}`}.`);
  }

  return errors;
}
