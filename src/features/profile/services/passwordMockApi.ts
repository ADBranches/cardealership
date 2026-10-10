import type { PasswordChangeResult, PasswordChangeValues } from "../types";

const MOCK_DELAY_MS = 350;

export async function changeMockPassword(values: PasswordChangeValues): Promise<PasswordChangeResult> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  if (values.currentPassword === "expired-session") {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Your session has expired. Please sign in again.",
    };
  }

  if (values.currentPassword === "incorrect-password") {
    return {
      success: false,
      code: "CURRENT_PASSWORD_INCORRECT",
      message: "The current password is incorrect.",
    };
  }

  if (values.currentPassword === "rate-limited") {
    return {
      success: false,
      code: "RATE_LIMITED",
      message: "Too many password attempts. Please wait and try again.",
    };
  }

  return {
    success: true,
    message: "Password changed successfully in development mock mode.",
    mock: true,
  };
}
