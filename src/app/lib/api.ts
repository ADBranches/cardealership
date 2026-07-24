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

export const CARS_ENDPOINT = "/api/cars";

export type PaginatedCarsQuery = {
  page: number;
  limit: number;
};

/**
 * Future API contract for Ronald's paginated car endpoint.
 *
 * Expected backend route:
 * GET /api/cars?page=1&limit=12
 *
 * This helper only builds the URL for now.
 * The admin table still uses local vehicle data until the backend endpoint is confirmed.
 */
export function buildPaginatedCarsUrl({ page, limit }: PaginatedCarsQuery) {
  return `${CARS_ENDPOINT}?page=${page}&limit=${limit}`;
}

export const CAR_UPLOAD_ENDPOINT = "/api/cars/upload";

export function buildCarDetailsUrl(carId: number | string) {
  return `${CARS_ENDPOINT}/${carId}`;
}

export function buildUpdateCarUrl(carId: number | string) {
  return `${CARS_ENDPOINT}/${carId}`;
}

export function buildDeleteCarUrl(carId: number | string) {
  return `${CARS_ENDPOINT}/${carId}`;
}

/**
 * Future admin inventory endpoints.
 *
 * Upload:
 * POST /api/cars/upload
 * Content-Type: multipart/form-data
 * Authorization: Bearer <ADMIN_JWT_TOKEN>
 *
 * Create:
 * POST /api/cars
 * Authorization: Bearer <ADMIN_JWT_TOKEN>
 *
 * Update:
 * PUT /api/cars/:id
 * Authorization: Bearer <ADMIN_JWT_TOKEN>
 *
 * Delete:
 * DELETE /api/cars/:id
 * Authorization: Bearer <ADMIN_JWT_TOKEN>
 *
 * These helpers only prepare endpoint URLs.
 * Backend calls should be connected after the active backend folder,
 * route ownership, and admin JWT middleware are confirmed.
 */
