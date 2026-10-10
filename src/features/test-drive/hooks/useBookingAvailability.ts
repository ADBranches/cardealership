import { useEffect, useRef, useState } from "react";
import { loadBookingAvailability } from "../services/availabilityApi";
import type { AvailabilityState } from "../types/availability.types";

const IDLE_STATE: AvailabilityState = { status: "idle", result: null };

export function useBookingAvailability(vehicleId: string, date: string) {
  const [state, setState] = useState<AvailabilityState>(IDLE_STATE);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!vehicleId || !date) {
      setState(IDLE_STATE);
      return;
    }

    const controller = new AbortController();
    const requestId = ++requestIdRef.current;
    setState({ status: "loading", result: null });

    void loadBookingAvailability(vehicleId, date, { signal: controller.signal }).then((result) => {
      if (requestId !== requestIdRef.current || result.success === false && result.code === "ABORTED") return;
      setState({ status: result.success ? "ready" : "error", result });
    });

    return () => controller.abort();
  }, [date, vehicleId]);

  return state;
}
