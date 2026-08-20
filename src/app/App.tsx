import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/auth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PublicOnlyRoute } from "./components/auth/PublicOnlyRoute";
import { LoginPage } from "../pages/Login/LoginPage";
import RegisterPage from "../pages/Register";
import Admin from "../pages/Admin";
import { AdminChatPage } from "../pages/AdminChat/AdminChatPage";
import { AdminChatProvider } from "../features/admin-chat/context/AdminChatContext";
import TestTasks from "../pages/TestTasks/TestTasks";
import { HomePage } from "../pages/Home/HomePage";
import { SettingsPage } from "../pages/Settings/SettingsPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/test" element={<TestTasks />} />
          <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/Admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/Admin/chat" element={<ProtectedRoute><AdminChatProvider><AdminChatPage /></AdminChatProvider></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/*" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
