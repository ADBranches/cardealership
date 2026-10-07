export const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

const ALLOWED_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function isBookingStatus(value) {
  return typeof value === "string" && BOOKING_STATUSES.includes(value);
}

export function canTransitionBooking(from, to) {
  return isBookingStatus(from) && isBookingStatus(to) && from !== to && ALLOWED_TRANSITIONS[from].includes(to);
}
