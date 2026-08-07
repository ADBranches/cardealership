import bcrypt from "bcrypt";

import { findUserByEmail, createUser } from "../models/userModel.js";

import { generateToken } from "../utils/jwt.js";

/*
|--------------------------------------------------------------------------
| REGISTER USER
|--------------------------------------------------------------------------
*/

export const register = async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    const allowedRoles = ["user", "admin"];

    const normalizedRole = allowedRoles.includes(role) ? role : "user";

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser(
      name.trim(),
      normalizedEmail,
      hashedPassword,
      normalizedRole,
    );

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration failed:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed.",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| LOGIN USER
|--------------------------------------------------------------------------
*/

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login failed:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed.",
      error: error.message,
    });
  }
};
