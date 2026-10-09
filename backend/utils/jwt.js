import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: Number(user.token_version || 0),
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};