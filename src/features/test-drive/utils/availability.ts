import type { AvailabilitySlot, AvailabilitySuccess } from "../types/availability.types";

export function normalizeSlots(allSlots: string[], availableSlots: string[]): AvailabilitySlot[] {
  const all = [...new Set(allSlots.map((slot) => slot.trim()).filter(Boolean))];
  const available = new Set(availableSlots.map((slot) => slot.trim()).filter(Boolean));
  return all.map((time) => ({ time, available: available.has(time) }));
}

export function buildAvailabilityResult(input: {
  vehicleId: string;
  date: string;
  allSlots: string[];
  availableSlots: string[];
  mock: boolean;
  message: string;
}): AvailabilitySuccess {
  const slots = normalizeSlots(input.allSlots, input.availableSlots);
  return {
    success: true,
    vehicleId: input.vehicleId,
    date: input.date,
    slots,
    availableSlots: slots.filter((slot) => slot.available).map((slot) => slot.time),
    reservedSlots: slots.filter((slot) => !slot.available).map((slot) => slot.time),
    mock: input.mock,
    message: input.message,
  };
}
