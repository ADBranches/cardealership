import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { AuthProvider } from "./context/auth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PublicOnlyRoute } from "./components/auth/PublicOnlyRoute";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { LoginPage } from "../pages/Login/LoginPage";
import RegisterPage from "../pages/Register";
import Admin from "../pages/Admin";
import { AdminChatPage } from "../pages/AdminChat/AdminChatPage";
import { AdminChatProvider } from "../features/admin-chat/context/AdminChatContext";
import TestTasks from "../pages/TestTasks/TestTasks";
import { HomePage } from "../pages/Home/HomePage";
import { SettingsPage } from "../pages/Settings/SettingsPage";
import { useAuth } from "../features/auth/hooks";
import { VehicleDetailsPage } from "../pages/Cars/VehicleDetailsPage";

function AdminChatLayout() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <AdminChatProvider>
      <Outlet />
    </AdminChatProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/test" element={<TestTasks />} />

          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />

          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cars/:id" element={<VehicleDetailsPage />} />

          <Route
            path="/Admin"
            element={
              <ProtectedRoute>
                <AdminChatLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Admin />} />
            <Route path="inventory" element={<AdminDashboard />} />
            <Route path="chat" element={<AdminChatPage />} />
          </Route>

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route path="/*" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
