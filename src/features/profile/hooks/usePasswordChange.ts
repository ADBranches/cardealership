import { useCallback, useState } from "react";
import { useAuth } from "../../auth/hooks";
import { changePassword } from "../services/passwordApi";
import type { PasswordChangeResult, PasswordChangeValues } from "../types";

export function usePasswordChange() {
  const { accessToken, logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<PasswordChangeResult | null>(null);

  const submitPasswordChange = useCallback(
    async (values: PasswordChangeValues): Promise<PasswordChangeResult> => {
      if (isSubmitting) {
        return {
          success: false,
          code: "PASSWORD_CHANGE_FAILED",
          message: "A password change is already in progress.",
        };
      }

      if (!accessToken) {
        const unauthorized: PasswordChangeResult = {
          success: false,
          code: "UNAUTHORIZED",
          message: "Your session has expired. Please sign in again.",
        };
        setResult(unauthorized);
        return unauthorized;
      }

      setIsSubmitting(true);
      setResult(null);

      try {
        const response = await changePassword(accessToken, values);
        setResult(response);
        if (!response.success && response.code === "UNAUTHORIZED") logout();
        return response;
      } finally {
        setIsSubmitting(false);
      }
    },
    [accessToken, isSubmitting, logout],
  );

  return { isSubmitting, result, submitPasswordChange };
}
