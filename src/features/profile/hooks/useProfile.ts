import { useMemo } from "react";
import { useAuth } from "@/features/auth/hooks";
import { readProfileFromSession } from "../services/profileApi";
import type { ProfileState } from "../types";

export function useProfile(): ProfileState {
  const { user, isAuthReady, error: authError } = useAuth();

  return useMemo(() => {
    if (!isAuthReady) return { profile: null, status: "loading", error: null };
    if (authError) {
      return {
        profile: null,
        status: "error",
        error: "Profile information is temporarily unavailable. Please sign in again.",
      };
    }

    const profile = readProfileFromSession(user);
    if (!profile) return { profile: null, status: "empty", error: null };
    return { profile, status: "ready", error: null };
  }, [authError, isAuthReady, user]);
}
