import { apiRequest } from "../../../api/client";
import type { AvailabilityResult } from "../types/availability.types";
import { buildAvailabilityResult } from "../utils/availability";
import { isValidBookingDate, normalizeBookingDate } from "../utils/bookingDate";
import { loadMockAvailability } from "./availabilityMockApi";

export const AVAILABILITY_ENDPOINT = "/api/bookings/check-availability";

type AvailabilityOptions = {
  mockMode?: boolean;
  fetcher?: typeof fetch;
  signal?: AbortSignal;
  today?: Date;
};

type RawAvailability = {
  success?: boolean;
  car_id?: string | number;
  date?: string;
  availableSlots?: string[];
  allSlots?: string[];
  message?: string;
};

export function isAvailabilityMockMode(value: string | undefined = import.meta.env.VITE_AVAILABILITY_MOCK_MODE): boolean {
  return value === "true";
}

export async function loadBookingAvailability(vehicleId: string, dateValue: string, options: AvailabilityOptions = {}): Promise<AvailabilityResult> {
  const date = normalizeBookingDate(dateValue);
  if (!vehicleId.trim() || !isValidBookingDate(date, options.today)) {
    return { success: false, code: "INVALID_REQUEST", message: "Choose a valid vehicle and a current or future date." };
  }

  try {
    if (options.mockMode ?? isAvailabilityMockMode()) {
      return await loadMockAvailability(vehicleId.trim(), date, options.signal);
    }

    const query = new URLSearchParams({ car_id: vehicleId.trim(), date });
    const path = `${AVAILABILITY_ENDPOINT}?${query.toString()}`;
    const response = options.fetcher
      ? await options.fetcher(path, { signal: options.signal, headers: { Accept: "application/json" } })
      : await apiRequest(path, { signal: options.signal, headers: { Accept: "application/json" } });

    if (response.status === 400) return { success: false, code: "INVALID_REQUEST", message: "Choose a valid vehicle and date." };
    if (response.status === 401) return { success: false, code: "UNAUTHORIZED", message: "Your session has expired. Please sign in again." };
    if (!response.ok) return { success: false, code: "AVAILABILITY_FAILED", message: "Availability could not be loaded. Please try again." };

    const data = await response.json().catch(() => ({})) as RawAvailability;
    if (!Array.isArray(data.allSlots) || !Array.isArray(data.availableSlots)) {
      return { success: false, code: "AVAILABILITY_FAILED", message: "Availability could not be loaded. Please try again." };
    }

    return buildAvailabilityResult({
      vehicleId: String(data.car_id ?? vehicleId),
      date: String(data.date ?? date),
      allSlots: data.allSlots,
      availableSlots: data.availableSlots,
      mock: false,
      message: data.message ?? "Availability loaded.",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { success: false, code: "ABORTED", message: "Availability request was cancelled." };
    }
    return { success: false, code: "AVAILABILITY_FAILED", message: "Availability could not be loaded. Please try again." };
  }
}
