import db from './config/db.js';

const tables = await db.query(`SELECT name FROM sqlite_master WHERE type='table'`);
console.log('Tables:', tables.rows.map(r => r.name).join(', '));

const cars = await db.query('SELECT COUNT(*) c FROM cars');
console.log('Cars:', cars.rows[0].c);

const bookings = await db.query('SELECT COUNT(*) c FROM bookings');
console.log('Bookings:', bookings.rows[0].c);

const users = await db.query('SELECT COUNT(*) c FROM users');
console.log('Users:', users.rows[0].c);

process.exit(0);