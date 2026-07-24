import { BrowserRouter, Routes, Route } from "react-router-dom";
import {LoginPage} from "../pages/Login/LoginPage";
import RegisterPage from "../pages/Register";
import Admin from "../pages/Admin";
import TestTasks from "../pages/TestTasks/TestTasks";
import {HomePage} from "../pages/Home/HomePage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>

<Route path="/test" element={<TestTasks />} />

<Route path="/login" element={<LoginPage />} />

<Route path="/register" element={<RegisterPage />} />

<Route path="/Admin" element={<Admin />} />

<Route path="/*" element={<HomePage />} />

</Routes>
    </BrowserRouter>
  );
}