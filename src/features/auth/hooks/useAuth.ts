import { useCallback, useSyncExternalStore } from "react";
import { getAuthToken, isAuthenticated as checkAuth } from "../services";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function useAuth() {
  const authenticated = useSyncExternalStore(
    subscribe,
    () => checkAuth(),
    () => false
  );

  const token = useSyncExternalStore(
    subscribe,
    () => getAuthToken(),
    () => null
  );

  const refreshAuth = useCallback(() => {
    window.dispatchEvent(new Event("storage"));
  }, []);

  return {
    isAuthenticated: authenticated,
    token,
    refreshAuth,
  };
}
