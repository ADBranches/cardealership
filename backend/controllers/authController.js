import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "../models/userModel.js";
import { generateToken } from "../utils/jwt.js";

// REGISTER
export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser(name, email, hashedPassword, role);

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN (SIMULATES PASSPORT FLOW)
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // STEP 1: find user
    const user = await findUserByEmail(email);

console.log("USER FOUND:", user);

if (!user) {
  console.log("NO USER FOUND");
  return res.status(401).json({ message: "Invalid credentials" });
}

console.log("PASSWORD INPUT:", password);
console.log("HASH IN DB:", user.password);

const isMatch = await bcrypt.compare(password, user.password);

console.log("PASSWORD MATCH:", isMatch);

if (!isMatch) {
  console.log("PASSWORD DOES NOT MATCH");
  return res.status(401).json({ message: "Invalid credentials" });
}

    // STEP 3: generate token
    const token = generateToken(user);

    // STEP 4: respond
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};