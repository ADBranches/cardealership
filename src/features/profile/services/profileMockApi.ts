import type { AuthUser } from "../../auth/types";
import type { ProfileFormValues, ProfileUpdateResult } from "../types";

const MOCK_DELAY_MS = 350;

export const SYNTHETIC_PROFILE_USER: AuthUser = {
  id: "mock-customer-001",
  name: "Demo Customer",
  email: "demo.customer@example.com",
  role: "user",
};

export async function updateMockProfile(
  currentUser: AuthUser,
  values: ProfileFormValues,
): Promise<ProfileUpdateResult> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  const email = values.email.trim().toLowerCase();

  if (email === "expired.session@example.com") {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Your session has expired. Please sign in again.",
    };
  }

  if (email === "existing.customer@example.com") {
    return {
      success: false,
      code: "EMAIL_CONFLICT",
      message: "That email address is already in use.",
    };
  }

  if (email === "server.failure@example.com") {
    return {
      success: false,
      code: "PROFILE_UPDATE_FAILED",
      message: "Profile information could not be updated. Please try again.",
    };
  }

  return {
    success: true,
    message: "Profile updated successfully in development mock mode.",
    mock: true,
    user: {
      ...currentUser,
      name: values.name.trim(),
      email,
    },
  };
}
