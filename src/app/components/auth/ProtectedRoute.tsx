import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingSpinner } from "../../../components/common/LoadingSpinner/LoadingSpinner";
import { useAuth } from "../../../features/auth/hooks";
import { getProtectedRouteDecision } from "./routeAccess";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthReady, isAuthenticated } = useAuth();
  const location = useLocation();
  const decision = getProtectedRouteDecision(isAuthReady, isAuthenticated);

  if (decision === "loading") return <LoadingSpinner />;
  if (decision === "redirect-login") {
    const requestedPath = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(requestedPath)}`} replace />;
  }
  return <>{children}</>;
}
