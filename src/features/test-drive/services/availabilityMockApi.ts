import type { AvailabilityResult } from "../types/availability.types";
import { buildAvailabilityResult } from "../utils/availability";

const ALL_SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "15:30"];
const AVAILABLE_SLOTS = ["09:00", "09:30", "10:30", "11:00", "13:00", "15:30"];

export async function loadMockAvailability(vehicleId: string, date: string, signal?: AbortSignal): Promise<AvailabilityResult> {
  if (signal?.aborted) throw new DOMException("The operation was aborted.", "AbortError");
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, 250);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("The operation was aborted.", "AbortError"));
    }, { once: true });
  });
  return buildAvailabilityResult({
    vehicleId,
    date,
    allSlots: ALL_SLOTS,
    availableSlots: AVAILABLE_SLOTS,
    mock: true,
    message: "Synthetic development availability returned.",
  });
}
