import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { LoadingSpinner } from "../../../components/common/LoadingSpinner/LoadingSpinner";
import { useAuth } from "../../../features/auth/hooks";
import { getAdminRouteDecision } from "./routeAccess";
export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isAuthReady, isAuthenticated } = useAuth();
  const decision=getAdminRouteDecision(isAuthReady,isAuthenticated,user?.role);
  if(decision==="loading") return <LoadingSpinner/>;
  if(decision==="redirect-login") return <Navigate to="/login?redirect=/Admin" replace/>;
  if(decision==="deny") return <main className="min-h-screen grid place-items-center" role="alert"><h1>Administrator access required</h1></main>;
  return <>{children}</>;
}
