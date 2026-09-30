import type { BookingStatus } from "../types";

export const BOOKING_STATUS_COLUMNS: readonly BookingStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

const ALLOWED_TRANSITIONS: Readonly<Record<BookingStatus, readonly BookingStatus[]>> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function isBookingStatus(value: unknown): value is BookingStatus {
  return typeof value === "string" && BOOKING_STATUS_COLUMNS.includes(value as BookingStatus);
}

export function getAllowedBookingTransitions(status: BookingStatus): readonly BookingStatus[] {
  return ALLOWED_TRANSITIONS[status];
}

export function canTransitionBooking(from: BookingStatus, to: BookingStatus): boolean {
  return from !== to && ALLOWED_TRANSITIONS[from].includes(to);
}
