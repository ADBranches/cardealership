import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { resolveAdministratorReset } from './config/security.js';

const { email, password } = resolveAdministratorReset();
const { default: db } = await import('./config/db.js');
const hash = await bcrypt.hash(password, 10);

const existing = await db.query('SELECT id, role FROM users WHERE email = ?', [email]);
if (existing.rows.length > 0) {
  if (existing.rows[0].role !== 'admin') throw new Error('Refusing to promote an existing non-administrator account.');
  await db.query("UPDATE users SET password = ? WHERE email = ? AND role = 'admin'", [hash, email]);
  console.log('Administrator password reset successfully.');
} else {
  await db.query(
    "INSERT INTO users (name, email, password, role) VALUES ('Admin', ?, ?, 'admin')",
    [email, hash]
  );
  console.log('Administrator created successfully.');
}
process.exit(0);
