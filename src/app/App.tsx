import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { AuthProvider } from "./context/auth";
import { lazy, Suspense, type ReactNode } from "react";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PublicOnlyRoute } from "./components/auth/PublicOnlyRoute";
import { useAuth } from "../features/auth/hooks";
import { RouteErrorBoundary, RouteLoading } from "./components/routing/RouteFeedback";

const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const LoginPage = lazy(() => import("../pages/Login/LoginPage").then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("../pages/Register"));
const Admin = lazy(() => import("../pages/Admin"));
const AdminChatPage = lazy(() => import("../pages/AdminChat/AdminChatPage").then(m => ({ default: m.AdminChatPage })));
const AdminChatProvider = lazy(() => import("../features/admin-chat/context/AdminChatContext").then(m => ({ default: m.AdminChatProvider })));
const TestTasks = import.meta.env.DEV ? lazy(() => import("../pages/TestTasks/TestTasks")) : null;
const HomePage = lazy(() => import("../pages/Home/HomePage").then(m => ({ default: m.HomePage })));
const SettingsPage = lazy(() => import("../pages/Settings/SettingsPage").then(m => ({ default: m.SettingsPage })));
const VehicleDetailsPage = lazy(() => import("../pages/Cars/VehicleDetailsPage").then(m => ({ default: m.VehicleDetailsPage })));

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

function DevelopmentAdminRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return user?.role === "admin" ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <RouteErrorBoundary>
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              {TestTasks && (
                <Route path="/test" element={
                  <ProtectedRoute>
                    <DevelopmentAdminRoute><TestTasks /></DevelopmentAdminRoute>
                  </ProtectedRoute>
                } />
              )}

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
          </Suspense>
        </RouteErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}
