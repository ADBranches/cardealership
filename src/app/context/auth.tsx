import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { AuthError, AuthSession, AuthState } from "../../features/auth/types";
import { clearStoredSession, restoreStoredSession, saveSession } from "../../features/auth/services";

const initialAuthState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isRestoringSession: true,
  isAuthReady: false,
  error: null,
};

type AuthContextValue = AuthState & {
  login: (session: AuthSession) => void;
  logout: () => void;
  restoreSession: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function createAuthenticatedState(session: AuthSession): AuthState {
  return {
    user: session.user,
    accessToken: session.accessToken,
    isAuthenticated: true,
    isRestoringSession: false,
    isAuthReady: true,
    error: null,
  };
}

export function createUnauthenticatedState(error: AuthError | null = null): AuthState {
  return {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isRestoringSession: false,
    isAuthReady: true,
    error,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialAuthState);
  const restorePromiseRef = useRef<Promise<void> | null>(null);

  const login = useCallback((session: AuthSession) => {
    saveSession(session);
    setState(createAuthenticatedState(session));
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    setState(createUnauthenticatedState());
  }, []);

  const restoreSession = useCallback(() => {
    if (restorePromiseRef.current) return restorePromiseRef.current;
    setState((current) => ({ ...current, isRestoringSession: true, isAuthReady: false, error: null }));
    const restoration = restoreStoredSession()
      .then((session) => {
        setState(session ? createAuthenticatedState(session) : createUnauthenticatedState());
      })
      .catch(() => {
        clearStoredSession();
        setState(createUnauthenticatedState({ code: "SESSION_VERIFICATION_FAILED", message: "Session restoration could not be completed." }));
      })
      .finally(() => {
        restorePromiseRef.current = null;
      });
    restorePromiseRef.current = restoration;
    return restoration;
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const value = useMemo(() => ({ ...state, login, logout, restoreSession }), [state, login, logout, restoreSession]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
