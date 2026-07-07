export type TestDriveBookingPayload = {
  vehicleId: string;
  vehicleName?: string;
  date: string;
  time: string;
  phone: string;
  notes?: string;
};

export const TEST_DRIVE_BOOKING_ENDPOINT = "/api/test-drives";

export function getAuthToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("jwt")
  );
}

/**
 * TODO: Connect this helper to POST /api/test-drives once the active backend
 * structure and endpoint are confirmed by the team.
 *
 * Expected future request:
 * POST /api/test-drives
 *
 * Headers:
 * Authorization: Bearer <JWT_TOKEN>
 * Content-Type: application/json
 */
export async function submitTestDriveBookingDraft(
  payload: TestDriveBookingPayload
) {
  console.log("Prepared test drive booking payload:", {
    endpoint: TEST_DRIVE_BOOKING_ENDPOINT,
    payload,
  });

  return {
    success: true,
    message: "Booking payload prepared. Backend endpoint connection pending.",
  };
}
