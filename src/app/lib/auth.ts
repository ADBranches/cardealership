import { clearStoredSession, getAuthenticatedUser, getAuthToken as getCanonicalAuthToken, getStoredSession } from "../../features/auth/services/authStorage";
export const getAuthToken=getCanonicalAuthToken;
export const getStoredUser=getAuthenticatedUser;
export const isAuthenticated=()=>Boolean(getStoredSession());
export const isAdminUser=()=>getAuthenticatedUser()?.role==="admin";
export const clearAuthData=clearStoredSession;
