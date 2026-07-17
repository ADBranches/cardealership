import type { ComponentType } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Admin from "../pages/Admin";
import Home from "../pages/Home";
import Profile from "../pages/profile";


import ProtectedRoute from "../components/ProtectedRoute";

const ProtectedRouteComponent = ProtectedRoute as ComponentType<any>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

      {/* Protected Routes */}

<Route
  path="/admin"
  element={
    <ProtectedRouteComponent>
      <Admin />
    </ProtectedRouteComponent>
  }
/>

<Route
  path="/profile"
  element={
    <ProtectedRouteComponent>
      <Profile />
    </ProtectedRouteComponent>
  }
/>


{/* Home Route */}
<Route
  path="/"
  element={<Home />}
/>

{/* Catch unknown routes */}
<Route
  path="*"
  element={<Home />}
/>

</Routes>
</BrowserRouter>
);
}