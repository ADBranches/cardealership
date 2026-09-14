import type { BookingStatus, DispatchBooking, DispatchConnectionStatus, DispatchErrorCode } from "../types";

export type DispatchMutationState = {
  mutationId: number;
  previousStatus: BookingStatus;
  targetStatus: BookingStatus;
};

export type DispatchState = {
  bookings: DispatchBooking[];
  connectionStatus: DispatchConnectionStatus;
  pendingByBooking: Record<string, DispatchMutationState>;
  error: { code: DispatchErrorCode; message: string; bookingId?: string } | null;
};

export function createDispatchInitialState(bookings: DispatchBooking[] = []): DispatchState {
  return {
    bookings: [...bookings],
    connectionStatus: bookings.length > 0 ? "ready" : "idle",
    pendingByBooking: {},
    error: null,
  };
}
