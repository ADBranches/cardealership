import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Admin from "../pages/Admin";
import Home from "../pages/Home";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* AUTH PAGES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}