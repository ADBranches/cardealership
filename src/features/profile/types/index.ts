import type { AuthUser } from "@/features/auth/types";

export type ProfileStatus = "idle" | "loading" | "ready" | "empty" | "error";

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface ProfileFormValues {
  name: string;
  email: string;
}

export interface BookingHistoryItem {
  id: string;
  vehicleId: string;
  vehicleName: string;
  date: string;
  time: string;
  status: "upcoming" | "completed" | "cancelled";
}

export interface ProfileState {
  profile: CustomerProfile | null;
  status: ProfileStatus;
  error: string | null;
}

export function profileFromAuthUser(user: AuthUser): CustomerProfile {
  return {
    id: String(user.id),
    name: user.name?.trim() ?? "",
    email: user.email.trim(),
    role: user.role,
  };
}

export type ProfileUpdateErrorCode =
  | "VALIDATION_FAILED"
  | "UNAUTHORIZED"
  | "EMAIL_CONFLICT"
  | "PROFILE_UPDATE_FAILED";

export type ProfileUpdateResult =
  | {
      success: true;
      message: string;
      user: AuthUser;
      mock: boolean;
    }
  | {
      success: false;
      code: ProfileUpdateErrorCode;
      message: string;
    };

export interface PasswordChangeValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type PasswordChangeErrorCode =
  | "VALIDATION_FAILED"
  | "UNAUTHORIZED"
  | "CURRENT_PASSWORD_INCORRECT"
  | "RATE_LIMITED"
  | "PASSWORD_CHANGE_FAILED";

export type PasswordChangeResult =
  | {
      success: true;
      message: string;
      mock: boolean;
    }
  | {
      success: false;
      code: PasswordChangeErrorCode;
      message: string;
    };

export type BookingHistoryResult =
  | {
      success: true;
      bookings: BookingHistoryItem[];
      mock: boolean;
    }
  | {
      success: false;
      code: "UNAUTHORIZED" | "BOOKING_HISTORY_FAILED";
      message: string;
    };
