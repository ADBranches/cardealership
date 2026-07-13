import type { TestDriveBookingPayload } from "../types";

export const TEST_DRIVE_BOOKING_ENDPOINT = "/api/test-drives";

export const AVAILABLE_TEST_DRIVE_TIMES = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
] as const;

/**
 * TODO: Connect this helper to POST /api/test-drives once the active backend
 * structure and endpoint are confirmed by the team.
 */
export async function submitTestDriveBooking(
  payload: TestDriveBookingPayload
): Promise<{ success: boolean; message: string }> {
  console.log("Prepared test drive booking payload:", {
    endpoint: TEST_DRIVE_BOOKING_ENDPOINT,
    payload,
  });

  return {
    success: true,
    message: "Booking payload prepared. Backend endpoint connection pending.",
  };
}
