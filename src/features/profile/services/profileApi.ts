import type { AuthUser } from "@/features/auth/types";
import { profileFromAuthUser, type CustomerProfile } from "../types";

export const PROFILE_UPDATE_ENDPOINT = "/api/users/me";
export const PASSWORD_CHANGE_ENDPOINT = "/api/users/me/password";
export const BOOKING_HISTORY_ENDPOINT = "/api/bookings/me";

export function readProfileFromSession(user: AuthUser | null): CustomerProfile | null {
  return user ? profileFromAuthUser(user) : null;
}

export function sanitizeProfileError(): string {
  return "Profile information is temporarily unavailable. Please try again.";
}
