const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const AUTH_PASSWORD_MIN_LENGTH = Number(process.env.AUTH_PASSWORD_MIN_LENGTH || 8);
export const AUTH_PASSWORD_MAX_LENGTH = 128;
export const AUTH_EMAIL_MAX_LENGTH = 254;
export const AUTH_NAME_MAX_LENGTH = 120;

export function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function normalizeName(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export function validateEmail(value) {
  const email = normalizeEmail(value);
  if (!email) return "Email is required.";
  if (email.length > AUTH_EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(email)) return "Enter a valid email address.";
  return null;
}

export function validatePassword(value) {
  if (typeof value !== "string" || !value) return "Password is required.";
  if (value.length < AUTH_PASSWORD_MIN_LENGTH) return `Password must contain at least ${AUTH_PASSWORD_MIN_LENGTH} characters.`;
  if (value.length > AUTH_PASSWORD_MAX_LENGTH) return `Password must contain no more than ${AUTH_PASSWORD_MAX_LENGTH} characters.`;
  return null;
}

export function validateRegistrationInput(input = {}) {
  const errors = {};
  const name = normalizeName(input.name);
  const email = normalizeEmail(input.email);
  if (!name) errors.name = "Name is required.";
  else if (name.length > AUTH_NAME_MAX_LENGTH) errors.name = `Name must contain no more than ${AUTH_NAME_MAX_LENGTH} characters.`;
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  const passwordError = validatePassword(input.password);
  if (passwordError) errors.password = passwordError;
  return { valid: Object.keys(errors).length === 0, errors, value: { name, email, password: input.password } };
}

export function validateLoginInput(input = {}) {
  const errors = {};
  const email = normalizeEmail(input.email);
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  if (typeof input.password !== "string" || !input.password) errors.password = "Password is required.";
  return { valid: Object.keys(errors).length === 0, errors, value: { email, password: input.password } };
}
