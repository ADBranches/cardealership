import type { ReactNode } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { LoadingSpinner } from "../../../components/common/LoadingSpinner/LoadingSpinner";
import { useAuth } from "../../../features/auth/hooks";
import { getPublicOnlyRouteDecision, getSafeRedirectPath } from "./routeAccess";

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthReady, isAuthenticated, user } = useAuth();
  const [searchParams] = useSearchParams();
  const decision = getPublicOnlyRouteDecision(isAuthReady, isAuthenticated);

  if (decision === "loading") return <LoadingSpinner />;
  if (decision === "redirect-authenticated") {
    const fallback = user?.role === "admin" ? "/Admin" : "/";
    return <Navigate to={getSafeRedirectPath(searchParams.get("redirect"), fallback)} replace />;
  }
  return <>{children}</>;
}
