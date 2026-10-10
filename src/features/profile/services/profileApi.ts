import type { AuthUser } from "../../auth/types";
import { authenticatedApiRequest } from "../../../api/client";
import {
  profileFromAuthUser,
  type CustomerProfile,
  type ProfileFormValues,
  type ProfileUpdateResult,
} from "../types";
import { updateMockProfile } from "./profileMockApi";

export const PROFILE_UPDATE_ENDPOINT = "/api/users/me";
export const PASSWORD_CHANGE_ENDPOINT = "/api/users/me/password";
export const BOOKING_HISTORY_ENDPOINT = "/api/bookings/me";

type ProfileUpdateOptions = {
  mockMode?: boolean;
  fetcher?: typeof fetch;
};

export function readProfileFromSession(user: AuthUser | null): CustomerProfile | null {
  return user ? profileFromAuthUser(user) : null;
}

export function isProfileMockMode(
  value: string | undefined = import.meta.env.VITE_PROFILE_MOCK_MODE,
): boolean {
  return value === "true";
}

function normalizeFailure(status: number): ProfileUpdateResult {
  if (status === 401) return { success: false, code: "UNAUTHORIZED", message: "Your session has expired. Please sign in again." };
  if (status === 409) return { success: false, code: "EMAIL_CONFLICT", message: "That email address is already in use." };
  if (status === 400) return { success: false, code: "VALIDATION_FAILED", message: "Check the submitted profile information and try again." };
  return { success: false, code: "PROFILE_UPDATE_FAILED", message: "Profile information could not be updated. Please try again." };
}

export async function updateProfile(
  currentUser: AuthUser,
  accessToken: string,
  values: ProfileFormValues,
  options: ProfileUpdateOptions = {},
): Promise<ProfileUpdateResult> {
  if (options.mockMode ?? isProfileMockMode()) {
    return updateMockProfile(currentUser, values);
  }

  try {
    const requestOptions: RequestInit = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
      }),
    };
    const response = options.fetcher
      ? await options.fetcher(PROFILE_UPDATE_ENDPOINT, {
          ...requestOptions,
          headers: {
            ...requestOptions.headers,
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
      : await authenticatedApiRequest(PROFILE_UPDATE_ENDPOINT, accessToken, requestOptions);
    const data = (await response.json().catch(() => ({}))) as { message?: string; user?: AuthUser };
    if (!response.ok || !data.user) return normalizeFailure(response.status);
    return {
      success: true,
      message: data.message ?? "Profile updated successfully.",
      user: { ...data.user, id: String(data.user.id) },
      mock: false,
    };
  } catch {
    return { success: false, code: "PROFILE_UPDATE_FAILED", message: "Profile information could not be updated. Please try again." };
  }
}
