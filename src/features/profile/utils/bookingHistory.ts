import type { BookingHistoryItem } from "../types";

export function sortBookingHistory(items: BookingHistoryItem[]) {
  return [...items].sort(
    (a, b) =>
      new Date(`${a.date}T${a.time}`).getTime() -
      new Date(`${b.date}T${b.time}`).getTime(),
  );
}

export function groupBookingHistory(items: BookingHistoryItem[]) {
  const sorted = sortBookingHistory(items);

  return {
    upcoming: sorted.filter((item) => item.status === "upcoming"),
    completed: sorted.filter((item) => item.status === "completed"),
    cancelled: sorted.filter((item) => item.status === "cancelled"),
  };
}
