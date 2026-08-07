export type RouteDecision = "loading" | "allow" | "redirect-login" | "redirect-authenticated";

export function getProtectedRouteDecision(isAuthReady: boolean, isAuthenticated: boolean): RouteDecision {
  if (!isAuthReady) return "loading";
  return isAuthenticated ? "allow" : "redirect-login";
}

export function getPublicOnlyRouteDecision(isAuthReady: boolean, isAuthenticated: boolean): RouteDecision {
  if (!isAuthReady) return "loading";
  return isAuthenticated ? "redirect-authenticated" : "allow";
}

export function getSafeRedirectPath(value: string | null, fallback = "/"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
