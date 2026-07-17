import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProtectedRoute from '../components/ProtectedRoute';

// Import your pages/components
import Home from '../pages/Home';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import ProfileSettings from '../components/ProfileSettings';
import AdminPanel from '../pages/AdminPanel';
import DealerDashboard from '../pages/DealerDashboard';
import NotFound from '../pages/NotFound';

/**
 * App Router Configuration
 * Sets up all routes with appropriate guards
 */
const AppRoutes = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
      />

      {/* Protected Routes - Authenticated Users Only */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileSettings />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Dealer Only */}
      <Route
        path="/dealer"
        element={
          <ProtectedRoute requiredRole="dealer">
            <DealerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Admin Only */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminPanel />
          </ProtectedRoute>
        }
      />

      {/* Catch-all - 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;