import assert from "node:assert/strict";
import {
  createDispatchService,
  DISPATCH_LIST_ENDPOINT,
  dispatchMutationEndpoint,
} from "../features/admin-dispatch/services/dispatchApi";

const calls: Array<{
  path: string;
  token: string;
  options?: RequestInit;
}> = [];

const service = createDispatchService({
  mockMode: false,
  isProduction: false,
  fetcher: async (path, token, options) => {
    calls.push({ path, token, options });

    if (options?.method === "PUT") {
      return new Response(
        JSON.stringify({
          success: true,
          booking: {
            id: "booking-1",
            user_name: "Synthetic Customer",
            car_id: "car-1",
            car_model: "Synthetic Vehicle",
            booking_date: "2026-09-15",
            time_slot: "10:00",
            status: "confirmed",
            updatedAt: "2026-09-14T13:00:00.000Z",
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        bookings: [
          {
            id: "booking-1",
            user_name: "Synthetic Customer",
            car_id: "car-1",
            car_model: "Synthetic Vehicle",
            booking_date: "2026-09-15",
            time_slot: "10:00",
            status: "pending",
            updatedAt: "2026-09-14T12:00:00.000Z",
          },
        ],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  },
});

const listed = await service.listBookings("redacted-token");
assert.equal(listed.success, true);
assert.equal(calls[0].path, DISPATCH_LIST_ENDPOINT);
assert.equal(calls[0].token, "redacted-token");

const updated = await service.updateBookingStatus(
  "redacted-token",
  "booking-1",
  "confirmed",
  "2026-09-14T12:00:00.000Z",
);

assert.equal(updated.success, true);
assert.equal(calls[1].path, dispatchMutationEndpoint("booking-1"));
assert.equal(calls[1].options?.method, "PUT");

const body = JSON.parse(String(calls[1].options?.body));
assert.equal(body.status, "confirmed");
assert.equal(
  body.expectedUpdatedAt,
  "2026-09-14T12:00:00.000Z",
);

if (updated.success) {
  assert.equal(updated.booking.status, "confirmed");
  assert.equal(
    updated.booking.updatedAt,
    "2026-09-14T13:00:00.000Z",
  );
}

const conflictService = createDispatchService({
  mockMode: false,
  isProduction: false,
  fetcher: async () =>
    new Response(
      JSON.stringify({
        code: "STALE_STATE",
        message: "Refresh and try again.",
      }),
      {
        status: 409,
        headers: { "Content-Type": "application/json" },
      },
    ),
});

const conflict = await conflictService.updateBookingStatus(
  "redacted-token",
  "booking-1",
  "confirmed",
  "stale-version",
);

assert.equal(conflict.success, false);
if (!conflict.success) assert.equal(conflict.code, "CONFLICT");

assert.equal(
  JSON.stringify({ listed, updated, conflict }).includes(
    "redacted-token",
  ),
  false,
);

console.log(
  JSON.stringify(
    {
      suite: "dispatchApi",
      passed: 13,
      failed: 0,
      authenticationHelperVerified: true,
      liveListContractVerified: true,
      liveMutationContractVerified: true,
      expectedUpdatedAtVerified: true,
      authoritativeResponseVerified: true,
      conflictMappingVerified: true,
      privateValuesLogged: false,
      syntheticDataUsed: true,
    },
    null,
    2,
  ),
);
