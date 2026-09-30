import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/hooks";
import { loadBookingHistory } from "../services/bookingHistoryApi";
import type { BookingHistoryResult } from "../types";

export function useBookingHistory() {
  const { accessToken, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] =
    useState<BookingHistoryResult | null>(null);

  const refresh = useCallback(async () => {
    if (!accessToken) {
      const unauthorized: BookingHistoryResult = {
        success: false,
        code: "UNAUTHORIZED",
        message: "Your session has expired. Please sign in again.",
      };
      setResult(unauthorized);
      setIsLoading(false);
      return unauthorized;
    }

    setIsLoading(true);
    const response = await loadBookingHistory(accessToken);
    setResult(response);
    setIsLoading(false);

    if (!response.success && response.code === "UNAUTHORIZED") {
      logout();
    }

    return response;
  }, [accessToken, logout]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { isLoading, result, refresh };
}
