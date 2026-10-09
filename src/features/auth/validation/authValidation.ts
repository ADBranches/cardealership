export type RegistrationValues = { firstName: string; lastName: string; email: string; password: string; confirmPassword: string };
export type RegistrationErrors = Partial<Record<keyof RegistrationValues, string>>;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_POLICY = "Use 8 to 128 characters with an uppercase letter, lowercase letter and number.";
export function normalizeEmail(value: string) { return value.trim().toLowerCase(); }
export function validateRegistration(values: RegistrationValues): RegistrationErrors {
  const errors: RegistrationErrors = {};
  if (!values.firstName.trim()) errors.firstName = "First name is required.";
  if (!values.lastName.trim()) errors.lastName = "Last name is required.";
  const email = normalizeEmail(values.email);
  if (!email) errors.email = "Email is required."; else if (email.length > 254 || !emailPattern.test(email)) errors.email = "Enter a valid email address.";
  if (values.password.length < 8 || values.password.length > 128 || !/[a-z]/.test(values.password) || !/[A-Z]/.test(values.password) || !/\d/.test(values.password)) errors.password = PASSWORD_POLICY;
  if (!values.confirmPassword) errors.confirmPassword = "Confirm your password."; else if (values.confirmPassword !== values.password) errors.confirmPassword = "Password confirmation does not match.";
  return errors;
}
export function hasRegistrationErrors(errors: RegistrationErrors) { return Object.keys(errors).length > 0; }
