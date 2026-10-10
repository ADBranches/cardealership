import type { ProfileFormValues } from "../types";

export type ProfileValidationErrors = Partial<Record<keyof ProfileFormValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateProfile(values: ProfileFormValues): ProfileValidationErrors {
  const errors: ProfileValidationErrors = {};
  const name = values.name.trim();
  const email = values.email.trim().toLowerCase();

  if (!name) errors.name = "Display name is required.";
  else if (name.length < 2) errors.name = "Display name must contain at least 2 characters.";
  else if (name.length > 80) errors.name = "Display name must not exceed 80 characters.";

  if (!email) errors.email = "Email address is required.";
  else if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address.";

  return errors;
}

export function hasProfileValidationErrors(errors: ProfileValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
