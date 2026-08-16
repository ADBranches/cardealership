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
