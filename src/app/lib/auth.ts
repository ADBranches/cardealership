function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getAuthToken() {
  if (!canUseLocalStorage()) {
    return null;
  }

  return (
    localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken")
  );
}

export function isAuthenticated() {
  if (!canUseLocalStorage()) {
    return false;
  }

  return Boolean(
    getAuthToken() ||
      localStorage.getItem("user") ||
      localStorage.getItem("role") ||
      localStorage.getItem("isAdmin")
  );
}

export function isAdminUser() {
  if (!canUseLocalStorage()) {
    return false;
  }

  const rawUser = localStorage.getItem("user");
  const role = localStorage.getItem("role");
  const isAdmin = localStorage.getItem("isAdmin");

  if (isAdmin === "true") {
    return true;
  }

  if (role === "admin") {
    return true;
  }

  if (!rawUser) {
    return false;
  }

  try {
    const user = JSON.parse(rawUser);
    return user?.role === "admin" || user?.isAdmin === true;
  } catch {
    return false;
  }
}
