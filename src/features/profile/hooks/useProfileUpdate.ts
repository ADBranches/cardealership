import { useCallback, useState } from "react";
import { useAuth } from "@/features/auth/hooks";
import { updateProfile } from "../services/profileApi";
import type { ProfileFormValues, ProfileUpdateResult } from "../types";

export function useProfileUpdate() {
  const { user, accessToken, updateUser, logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ProfileUpdateResult | null>(null);

  const submitProfile = useCallback(
    async (values: ProfileFormValues): Promise<ProfileUpdateResult> => {
      if (isSubmitting) {
        return {
          success: false,
          code: "PROFILE_UPDATE_FAILED",
          message: "A profile update is already in progress.",
        };
      }

      if (!user || !accessToken) {
        const unauthorized: ProfileUpdateResult = {
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
        const response = await updateProfile(user, accessToken, values);
        setResult(response);

        if (response.success) updateUser(response.user);
        else if (response.code === "UNAUTHORIZED") logout();

        return response;
      } finally {
        setIsSubmitting(false);
      }
    },
    [accessToken, isSubmitting, logout, updateUser, user],
  );

  return { isSubmitting, result, submitProfile };
}
