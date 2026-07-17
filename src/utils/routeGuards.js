/**
 * Route Guards/Middleware
 * Functions to check authentication and authorization
 */

/**
 * Check if user is authenticated
 * @param {Object} authState - Redux auth state
 * @returns {boolean} - True if user is authenticated
 */
export const isUserAuthenticated = (authState) => {
  return authState?.isAuthenticated && authState?.user !== null;
};

/**
 * Check if user has required role
 * @param {Object} authState - Redux auth state
 * @param {string} requiredRole - Role required for access
 * @returns {boolean} - True if user has the required role
 */
export const hasRequiredRole = (authState, requiredRole) => {
  if (!isUserAuthenticated(authState)) {
    return false;
  }
  return authState.user?.role === requiredRole;
};

/**
 * Check if user has any of the required roles
 * @param {Object} authState - Redux auth state
 * @param {Array<string>} requiredRoles - Roles that grant access
 * @returns {boolean} - True if user has any of the required roles
 */
export const hasAnyRole = (authState, requiredRoles = []) => {
  if (!isUserAuthenticated(authState) || !Array.isArray(requiredRoles)) {
    return false;
  }
  return requiredRoles.includes(authState.user?.role);
};

/**
 * Check if authentication token is valid and not expired
 * @returns {boolean} - True if token exists and is valid
 */
export const isTokenValid = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }

  try {
    // Decode JWT token
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const decoded = JSON.parse(jsonPayload);
    const currentTime = Date.now() / 1000;

    // Check if token is expired
    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

/**
 * Get stored authentication token
 * @returns {string|null} - Authentication token or null
 */
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Check if user can access admin routes
 * @param {Object} authState - Redux auth state
 * @returns {boolean} - True if user can access admin
 */
export const canAccessAdmin = (authState) => {
  return (
    isUserAuthenticated(authState) &&
    (authState.user?.role === 'admin' || authState.user?.role === 'superadmin')
  );
};

/**
 * Check if user can access dealer routes
 * @param {Object} authState - Redux auth state
 * @returns {boolean} - True if user can access dealer routes
 */
export const canAccessDealer = (authState) => {
  return (
    isUserAuthenticated(authState) &&
    (authState.user?.role === 'dealer' || authState.user?.role === 'admin' || authState.user?.role === 'superadmin')
  );
};

/**
 * Clear authentication data
 * Used on logout
 */
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Store authentication data
 * @param {string} token - JWT token
 * @param {Object} user - User object
 */
export const storeAuthData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};