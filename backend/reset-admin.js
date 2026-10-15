import db from './config/db.js';
import bcrypt from 'bcryptjs';

const email = 'admin@dealership.com';
const password = 'admin123';
const hash = await bcrypt.hash(password, 10);

const existing = await db.query('SELECT id FROM users WHERE email = ?', [email]);
if (existing.rows.length > 0) {
  await db.query("UPDATE users SET password = ?, role = 'admin' WHERE email = ?", [hash, email]);
  console.log('Admin password reset to admin123');
} else {
  await db.query(
    "INSERT INTO users (name, email, password, role) VALUES ('Admin', ?, ?, 'admin')",
    [email, hash]
  );
  console.log('Admin created with password admin123');
}
process.exit(0);