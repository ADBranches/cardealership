import type { AvailabilityResult } from "../types";

export function isSelectedTimeAvailable(
  time: string,
  result: AvailabilityResult | null,
): boolean {
  return Boolean(
    time &&
      result?.success &&
      result.availableSlots.includes(time),
  );
}

export function shouldClearSelectedTime(
  time: string,
  result: AvailabilityResult | null,
): boolean {
  return Boolean(time) && !isSelectedTimeAvailable(time, result);
}

export function canSubmitWithAvailability(
  status: "idle" | "loading" | "ready" | "error",
  time: string,
  result: AvailabilityResult | null,
): boolean {
  return status === "ready" && isSelectedTimeAvailable(time, result);
}
