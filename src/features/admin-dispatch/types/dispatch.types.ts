export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export type ConfirmedBookingStatus = Exclude<
  BookingStatus,
  "completed"
>;

export type DispatchConnectionStatus =
  | "idle"
  | "refreshing"
  | "ready"
  | "disconnected"
  | "error";

export interface DispatchBooking {
  id: string;
  customerName: string;
  customerEmail?: string;
  vehicleId: string;
  vehicleName: string;
  bookingDate: string;
  timeSlot: string;
  status: BookingStatus;
  updatedAt?: string;
}

export type DispatchErrorCode =
  | "UNAUTHORIZED"
  | "INVALID_TRANSITION"
  | "CONFLICT"
  | "CONTRACT_UNAVAILABLE"
  | "DISPATCH_FAILED";

export type DispatchListResult =
  | {
      success: true;
      bookings: DispatchBooking[];
      mock: boolean;
    }
  | {
      success: false;
      code: DispatchErrorCode;
      message: string;
    };

export type DispatchMutationResult =
  | {
      success: true;
      booking: DispatchBooking;
      mock: boolean;
    }
  | {
      success: false;
      code: DispatchErrorCode;
      message: string;
      bookingId: string;
    };

export interface DispatchService {
  listBookings(
    accessToken: string,
  ): Promise<DispatchListResult>;

  updateBookingStatus(
    accessToken: string,
    bookingId: string,
    status: BookingStatus,
  ): Promise<DispatchMutationResult>;
}
