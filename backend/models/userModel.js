import db from "../config/db.js";

// FIND USER BY EMAIL
export const findUserByEmail = async (email) => {
  const result = await db.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0];
};

// CREATE USER
export const createUser = async (name, email, password) => {
  const result = await db.query(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, role`,
    [name, email, password]
  );

  return result.rows[0];
};