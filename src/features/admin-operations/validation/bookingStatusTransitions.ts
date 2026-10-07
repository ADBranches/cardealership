import type { BookingStatus } from "../types";

export const BOOKING_STATUSES: readonly BookingStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "rejected",
];

export const OPERATIONAL_BOOKING_STATUSES: readonly BookingStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

const ALLOWED_TRANSITIONS: Readonly<Record<BookingStatus, readonly BookingStatus[]>> = {
  pending: ["confirmed", "rejected", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  rejected: [],
};

export function isBookingStatus(value: unknown): value is BookingStatus {
  return typeof value === "string" && BOOKING_STATUSES.includes(value as BookingStatus);
}

export function getAllowedBookingTransitions(status: BookingStatus): readonly BookingStatus[] {
  return ALLOWED_TRANSITIONS[status];
}

export function canTransitionBooking(from: BookingStatus, to: BookingStatus): boolean {
  return from !== to && ALLOWED_TRANSITIONS[from].includes(to);
}

export function isTerminalBookingStatus(status: BookingStatus): boolean {
  return ALLOWED_TRANSITIONS[status].length === 0;
}
