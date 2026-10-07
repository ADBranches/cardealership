import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../features/auth/hooks";

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, accessToken } = useAuth();
  if (!accessToken || !user) return <Navigate to="/login?redirect=/Admin" replace />;
  if (user.role !== "admin") {
    return <main className="min-h-screen grid place-items-center bg-background px-6"><section className="max-w-xl text-center" role="alert" aria-labelledby="admin-denied-title"><p className="text-primary font-bold uppercase tracking-[0.2em]">403</p><h1 id="admin-denied-title" className="mt-3 text-4xl font-bold">Administrator access required</h1><p className="mt-4 text-muted-foreground">This signed-in account cannot access dealership administration.</p></section></main>;
  }
  return <>{children}</>;
}
