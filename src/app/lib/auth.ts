function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getAuthToken() {
  if (!canUseLocalStorage()) {
    return null;
  }

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("jwt") ||
    localStorage.getItem("accessToken")
  );
}

export function getStoredUser() {
  if (!canUseLocalStorage()) {
    return null;
  }

  const rawUser = localStorage.getItem("user");

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  if (!canUseLocalStorage()) {
    return false;
  }

  return Boolean(getAuthToken() || getStoredUser());
}

export function isAdminUser() {
  if (!canUseLocalStorage()) {
    return false;
  }

  const user = getStoredUser();
  const role = localStorage.getItem("role");
  const isAdmin = localStorage.getItem("isAdmin");

  if (user?.role === "admin" || user?.isAdmin === true) {
    return true;
  }

  if (role === "admin") {
    return true;
  }

  if (isAdmin === "true") {
    return true;
  }

  return false;
}
