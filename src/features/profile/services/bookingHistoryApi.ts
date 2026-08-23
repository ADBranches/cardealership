import { authenticatedApiRequest } from "../../../api/client";
import type {
  BookingHistoryItem,
  BookingHistoryResult,
} from "../types";
import { sortBookingHistory } from "../utils/bookingHistory";
import {
  BOOKING_HISTORY_ENDPOINT,
  isProfileMockMode,
} from "./profileApi";

type BookingHistoryOptions = {
  mockMode?: boolean;
  fetcher?: typeof fetch;
};

type RawBooking = {
  id?: string | number;
  _id?: string;
  car_id?: string | number;
  carId?: string | number;
  car_model?: string;
  carModel?: string;
  vehicleName?: string;
  booking_date?: string;
  date?: string;
  time_slot?: string;
  timeSlot?: string;
  status?: string;
};

const SYNTHETIC_BOOKINGS: BookingHistoryItem[] = [
  {
    id: "mock-booking-001",
    vehicleId: "mock-car-101",
    vehicleName: "Toyota Land Cruiser",
    date: "2026-09-14",
    time: "10:30",
    status: "upcoming",
  },
  {
    id: "mock-booking-002",
    vehicleId: "mock-car-202",
    vehicleName: "BMW X5",
    date: "2026-06-11",
    time: "14:00",
    status: "completed",
  },
  {
    id: "mock-booking-003",
    vehicleId: "mock-car-303",
    vehicleName: "Mercedes GLE",
    date: "2026-07-03",
    time: "09:30",
    status: "cancelled",
  },
];

function normalizeBooking(item: RawBooking): BookingHistoryItem {
  const date = String(item.booking_date ?? item.date ?? "");
  const suppliedStatus = String(item.status ?? "confirmed").toLowerCase();
  const isPast =
    new Date(`${date}T23:59:59`).getTime() < Date.now();

  const status: BookingHistoryItem["status"] =
    suppliedStatus === "cancelled"
      ? "cancelled"
      : suppliedStatus === "completed" || isPast
        ? "completed"
        : "upcoming";

  return {
    id: String(item.id ?? item._id ?? ""),
    vehicleId: String(item.car_id ?? item.carId ?? ""),
    vehicleName:
      item.vehicleName ?? item.car_model ?? item.carModel ?? "Vehicle",
    date,
    time: String(item.time_slot ?? item.timeSlot ?? ""),
    status,
  };
}

export async function loadBookingHistory(
  accessToken: string,
  options: BookingHistoryOptions = {},
): Promise<BookingHistoryResult> {
  if (options.mockMode ?? isProfileMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      bookings: sortBookingHistory(SYNTHETIC_BOOKINGS),
      mock: true,
    };
  }

  try {
    const response = options.fetcher
      ? await options.fetcher(BOOKING_HISTORY_ENDPOINT, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
      : await authenticatedApiRequest(
          BOOKING_HISTORY_ENDPOINT,
          accessToken,
          { headers: { Accept: "application/json" } },
        );

    if (response.status === 401) {
      return {
        success: false,
        code: "UNAUTHORIZED",
        message: "Your session has expired. Please sign in again.",
      };
    }

    if (!response.ok) {
      return {
        success: false,
        code: "BOOKING_HISTORY_FAILED",
        message: "Booking history could not be loaded. Please try again.",
      };
    }

    const data = (await response.json().catch(() => ({}))) as {
      bookings?: RawBooking[];
    };

    return {
      success: true,
      bookings: sortBookingHistory(
        (data.bookings ?? []).map(normalizeBooking),
      ),
      mock: false,
    };
  } catch {
    return {
      success: false,
      code: "BOOKING_HISTORY_FAILED",
      message: "Booking history could not be loaded. Please try again.",
    };
  }
}
