import type { PasswordChangeValues } from "../types";

export type PasswordValidationErrors = Partial<Record<keyof PasswordChangeValues, string>>;

export function validatePasswordChange(values: PasswordChangeValues): PasswordValidationErrors {
  const errors: PasswordValidationErrors = {};

  if (!values.currentPassword) {
    errors.currentPassword = "Current password is required.";
  }

  if (!values.newPassword) {
    errors.newPassword = "New password is required.";
  } else if (values.newPassword.length < 8) {
    errors.newPassword = "New password must contain at least 8 characters.";
  } else if (!/[A-Z]/.test(values.newPassword) || !/[a-z]/.test(values.newPassword) || !/[0-9]/.test(values.newPassword)) {
    errors.newPassword = "Use uppercase, lowercase, and numeric characters.";
  } else if (values.newPassword === values.currentPassword) {
    errors.newPassword = "New password must differ from the current password.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirm the new password.";
  } else if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = "Password confirmation does not match.";
  }

  return errors;
}

export function hasPasswordValidationErrors(errors: PasswordValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
