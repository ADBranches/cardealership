import { useCallback, useEffect, useReducer, useRef } from "react";
import { useAuth } from "../../auth/hooks";
import { createDispatchService } from "../services/dispatchApi";
import { createDispatchInitialState, dispatchReducer } from "../state";
import type { BookingStatus, DispatchService } from "../types";
import { canTransitionBooking } from "../validation/bookingTransitions";

export type UseDispatchBoardOptions = { service?: DispatchService };

export function useDispatchBoard(options: UseDispatchBoardOptions = {}) {
  const { accessToken, logout } = useAuth();
  const [state, dispatch] = useReducer(dispatchReducer, undefined, () => createDispatchInitialState());
  const serviceRef = useRef(options.service ?? createDispatchService());
  const mutationSequenceRef = useRef(0);
  const loadSequenceRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++loadSequenceRef.current;
    const result = await serviceRef.current.listBookings(accessToken ?? "");
    if (requestId !== loadSequenceRef.current) return result;
    if (result.success) dispatch({ type: "bookings/load", bookings: result.bookings });
    else {
      dispatch({ type: "bookings/load-failed", code: result.code, message: result.message });
      if (result.code === "UNAUTHORIZED") logout();
    }
    return result;
  }, [accessToken, logout]);

  useEffect(() => { void refresh(); }, [refresh]);

  const moveBooking = useCallback(async (bookingId: string, targetStatus: BookingStatus) => {
    const booking = state.bookings.find((item) => item.id === bookingId);
    if (!booking || state.pendingByBooking[bookingId] || !canTransitionBooking(booking.status, targetStatus)) return false;
    const mutationId = ++mutationSequenceRef.current;
    dispatch({ type: "mutation/start", bookingId, targetStatus, mutationId });
    const result = await serviceRef.current.updateBookingStatus(accessToken ?? "", bookingId, targetStatus);
    if (result.success) dispatch({ type: "mutation/succeed", booking: result.booking, mutationId });
    else {
      dispatch({ type: "mutation/fail", bookingId, mutationId, code: result.code, message: result.message });
      if (result.code === "UNAUTHORIZED") logout();
    }
    return result.success;
  }, [accessToken, logout, state.bookings, state.pendingByBooking]);

  return { state, refresh, moveBooking };
}
