import {
  authenticatedApiRequest,
  type AuthenticatedApiFetcher,
} from "../../../api/client";
import type {
  BookingStatus,
  DispatchBooking,
  DispatchErrorCode,
  DispatchMutationResult,
  DispatchService,
} from "../types";
import {
  canTransitionBooking,
  isBookingStatus,
} from "../validation/bookingTransitions";

export const DISPATCH_LIST_ENDPOINT = "/api/admin/bookings";
export const dispatchMutationEndpoint = (bookingId: string) =>
  `/api/admin/bookings/${encodeURIComponent(bookingId)}/status`;

export type DispatchApiOptions = {
  mockMode?: boolean;
  isProduction?: boolean;
  fetcher?: AuthenticatedApiFetcher;
};

export type RawDispatchBooking = Record<string, unknown>;

type DispatchPayload = {
  success?: boolean;
  message?: string;
  code?: string;
  booking?: RawDispatchBooking;
  bookings?: RawDispatchBooking[];
  data?: RawDispatchBooking[];
};

export function isDispatchMockMode(
  value = import.meta.env?.VITE_ADMIN_DISPATCH_MOCK_MODE,
  isProduction = import.meta.env?.PROD,
): boolean {
  return !isProduction && value === "true";
}

export function normalizeDispatchBooking(
  raw: RawDispatchBooking,
): DispatchBooking | null {
  const id = String(raw.id ?? raw._id ?? "").trim();
  const statusValue = String(raw.status ?? "pending").toLowerCase();

  if (!id || !isBookingStatus(statusValue)) return null;

  return {
    id,
    customerName: String(
      raw.customerName ??
        raw.user_name ??
        raw.userName ??
        "Customer",
    ).trim(),
    customerEmail:
      String(
        raw.customerEmail ??
          raw.user_email ??
          raw.userEmail ??
          "",
      ).trim() || undefined,
    vehicleId: String(
      raw.vehicleId ??
        raw.car_id ??
        raw.carId ??
        "",
    ).trim(),
    vehicleName:
      String(
        raw.vehicleName ??
          raw.car_model ??
          raw.carModel ??
          [raw.make, raw.model].filter(Boolean).join(" ") ??
          "Vehicle",
      ).trim() || "Vehicle",
    bookingDate: String(
      raw.bookingDate ??
        raw.booking_date ??
        raw.date ??
        "",
    ).trim(),
    timeSlot: String(
      raw.timeSlot ??
        raw.time_slot ??
        "",
    ).trim(),
    status: statusValue,
    updatedAt:
      String(raw.updatedAt ?? raw.updated_at ?? "").trim() ||
      undefined,
  };
}

function failureCode(status: number, code?: string): DispatchErrorCode {
  if (status === 401 || status === 403) return "UNAUTHORIZED";
  if (status === 404) return "BOOKING_NOT_FOUND";
  if (status === 409 || code === "STALE_STATE") return "CONFLICT";
  if (
    status === 400 ||
    status === 422 ||
    code === "VALIDATION_FAILED"
  ) {
    return code === "INVALID_TRANSITION"
      ? "INVALID_TRANSITION"
      : "VALIDATION_FAILED";
  }

  return "DISPATCH_FAILED";
}

const syntheticBooking: DispatchBooking = {
  id: "synthetic-booking-001",
  customerName: "Synthetic Customer",
  vehicleId: "synthetic-car-001",
  vehicleName: "Synthetic Vehicle",
  bookingDate: "2026-09-15",
  timeSlot: "10:00",
  status: "pending",
  updatedAt: "2026-09-14T12:00:00.000Z",
};

class DispatchApiService implements DispatchService {
  private bookings = [{ ...syntheticBooking }];

  constructor(private options: DispatchApiOptions) {}

  private mockEnabled(): boolean {
    return (
      this.options.mockMode ??
      isDispatchMockMode(
        undefined,
        this.options.isProduction ?? import.meta.env?.PROD,
      )
    );
  }

  private fetcher(): AuthenticatedApiFetcher {
    return this.options.fetcher ?? authenticatedApiRequest;
  }

  async listBookings(token: string) {
    if (!token.trim()) {
      return {
        success: false as const,
        code: "UNAUTHORIZED" as const,
        message: "Authentication is required.",
      };
    }

    if (this.mockEnabled()) {
      return {
        success: true as const,
        bookings: this.bookings.map((booking) => ({ ...booking })),
        mock: true,
      };
    }

    try {
      const response = await this.fetcher()(
        DISPATCH_LIST_ENDPOINT,
        token,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        },
      );

      const payload = (await response
        .json()
        .catch(() => ({}))) as DispatchPayload;

      if (!response.ok) {
        return {
          success: false as const,
          code: failureCode(response.status, payload.code),
          message:
            payload.message ??
            "Dispatch bookings could not be loaded.",
        };
      }

      const records = Array.isArray(payload.bookings)
        ? payload.bookings
        : Array.isArray(payload.data)
          ? payload.data
          : [];

      return {
        success: true as const,
        bookings: records
          .map(normalizeDispatchBooking)
          .filter(
            (booking): booking is DispatchBooking =>
              booking !== null,
          ),
        mock: false,
      };
    } catch {
      return {
        success: false as const,
        code: "DISPATCH_FAILED" as const,
        message: "Dispatch bookings could not be loaded.",
      };
    }
  }

  async updateBookingStatus(
    token: string,
    bookingId: string,
    status: BookingStatus,
    expectedUpdatedAt?: string,
  ): Promise<DispatchMutationResult> {
    if (!token.trim()) {
      return {
        success: false,
        code: "UNAUTHORIZED",
        message: "Authentication is required.",
        bookingId,
      };
    }

    if (this.mockEnabled()) {
      const index = this.bookings.findIndex(
        (booking) => booking.id === bookingId,
      );

      if (
        index < 0 ||
        !canTransitionBooking(this.bookings[index].status, status)
      ) {
        return {
          success: false,
          code: "INVALID_TRANSITION",
          message: "Transition is unavailable.",
          bookingId,
        };
      }

      this.bookings[index] = {
        ...this.bookings[index],
        status,
        updatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        booking: { ...this.bookings[index] },
        mock: true,
      };
    }

    try {
      const response = await this.fetcher()(
        dispatchMutationEndpoint(bookingId),
        token,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            expectedUpdatedAt,
          }),
        },
      );

      const payload = (await response
        .json()
        .catch(() => ({}))) as DispatchPayload;

      if (!response.ok) {
        return {
          success: false,
          code: failureCode(response.status, payload.code),
          message:
            payload.message ??
            "Booking status could not be updated.",
          bookingId,
        };
      }

      const booking = payload.booking
        ? normalizeDispatchBooking(payload.booking)
        : null;

      if (!booking) {
        return {
          success: false,
          code: "DISPATCH_FAILED",
          message:
            "The server returned an invalid booking response.",
          bookingId,
        };
      }

      return {
        success: true,
        booking,
        mock: false,
      };
    } catch {
      return {
        success: false,
        code: "DISPATCH_FAILED",
        message: "Booking status could not be updated.",
        bookingId,
      };
    }
  }
}

export function createDispatchService(
  options: DispatchApiOptions = {},
): DispatchService {
  if (
    (options.isProduction ?? import.meta.env?.PROD) &&
    options.mockMode
  ) {
    throw new Error(
      "Mock dispatch service is disabled in production.",
    );
  }

  return new DispatchApiService(options);
}
