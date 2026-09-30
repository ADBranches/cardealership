import type { BookingStatus, DispatchBooking, DispatchErrorCode } from "../types";
import { canTransitionBooking } from "../validation/bookingTransitions";
import type { DispatchState } from "./dispatchInitialState";

export type DispatchAction =
  | { type: "bookings/load"; bookings: DispatchBooking[] }
  | { type: "bookings/load-failed"; code: DispatchErrorCode; message: string }
  | { type: "mutation/start"; bookingId: string; targetStatus: BookingStatus; mutationId: number }
  | { type: "mutation/succeed"; booking: DispatchBooking; mutationId: number }
  | { type: "mutation/fail"; bookingId: string; mutationId: number; code: DispatchErrorCode; message: string };

function replaceBooking(bookings: DispatchBooking[], replacement: DispatchBooking): DispatchBooking[] {
  return bookings.map((booking) => booking.id === replacement.id ? replacement : booking);
}

export function dispatchReducer(state: DispatchState, action: DispatchAction): DispatchState {
  if (action.type === "bookings/load") {
    return { ...state, bookings: [...action.bookings], connectionStatus: "ready", error: null };
  }
  if (action.type === "bookings/load-failed") {
    return { ...state, connectionStatus: action.code === "CONTRACT_UNAVAILABLE" ? "disconnected" : "error", error: { code: action.code, message: action.message } };
  }
  if (action.type === "mutation/start") {
    if (state.pendingByBooking[action.bookingId]) return state;
    const booking = state.bookings.find((item) => item.id === action.bookingId);
    if (!booking || !canTransitionBooking(booking.status, action.targetStatus)) return state;
    return {
      ...state,
      bookings: replaceBooking(state.bookings, { ...booking, status: action.targetStatus }),
      pendingByBooking: {
        ...state.pendingByBooking,
        [action.bookingId]: { mutationId: action.mutationId, previousStatus: booking.status, targetStatus: action.targetStatus },
      },
      error: null,
    };
  }
  if (action.type === "mutation/succeed") {
    const pending = state.pendingByBooking[action.booking.id];
    if (!pending || pending.mutationId !== action.mutationId) return state;
    const pendingByBooking = { ...state.pendingByBooking };
    delete pendingByBooking[action.booking.id];
    return { ...state, bookings: replaceBooking(state.bookings, action.booking), pendingByBooking, error: null };
  }
  const pending = state.pendingByBooking[action.bookingId];
  if (!pending || pending.mutationId !== action.mutationId) return state;
  const booking = state.bookings.find((item) => item.id === action.bookingId);
  const pendingByBooking = { ...state.pendingByBooking };
  delete pendingByBooking[action.bookingId];
  return {
    ...state,
    bookings: booking ? replaceBooking(state.bookings, { ...booking, status: pending.previousStatus }) : state.bookings,
    pendingByBooking,
    error: { code: action.code, message: action.message, bookingId: action.bookingId },
  };
}
