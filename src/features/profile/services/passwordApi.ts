import { authenticatedApiRequest } from "../../../api/client";
import type { PasswordChangeResult, PasswordChangeValues } from "../types";
import { PASSWORD_CHANGE_ENDPOINT, isProfileMockMode } from "./profileApi";
import { changeMockPassword } from "./passwordMockApi";

type PasswordChangeOptions = {
  mockMode?: boolean;
  fetcher?: typeof fetch;
};

function normalizePasswordFailure(status: number): PasswordChangeResult {
  if (status === 401) return { success: false, code: "UNAUTHORIZED", message: "Your session has expired. Please sign in again." };
  if (status === 403) return { success: false, code: "CURRENT_PASSWORD_INCORRECT", message: "The current password is incorrect." };
  if (status === 429) return { success: false, code: "RATE_LIMITED", message: "Too many password attempts. Please wait and try again." };
  if (status === 400) return { success: false, code: "VALIDATION_FAILED", message: "Check the submitted password information and try again." };
  return { success: false, code: "PASSWORD_CHANGE_FAILED", message: "The password could not be changed. Please try again." };
}

export async function changePassword(
  accessToken: string,
  values: PasswordChangeValues,
  options: PasswordChangeOptions = {},
): Promise<PasswordChangeResult> {
  if (options.mockMode ?? isProfileMockMode()) return changeMockPassword(values);

  try {
    const requestOptions: RequestInit = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    };

    const response = options.fetcher
      ? await options.fetcher(PASSWORD_CHANGE_ENDPOINT, {
          ...requestOptions,
          headers: {
            ...requestOptions.headers,
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
      : await authenticatedApiRequest(PASSWORD_CHANGE_ENDPOINT, accessToken, requestOptions);

    const data = (await response.json().catch(() => ({}))) as { message?: string };
    if (!response.ok) return normalizePasswordFailure(response.status);

    return {
      success: true,
      message: data.message ?? "Password changed successfully.",
      mock: false,
    };
  } catch {
    return {
      success: false,
      code: "PASSWORD_CHANGE_FAILED",
      message: "The password could not be changed. Please try again.",
    };
  }
}
