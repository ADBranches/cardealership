// backend/config/db.js
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data.sqlite');
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

// Create tables on first run
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT,
    price REAL,
    year INTEGER,
    status TEXT DEFAULT 'available',
    image_url TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS car_specs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    car_id INTEGER NOT NULL UNIQUE,
    power TEXT,
    engine TEXT,
    drive TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS car_specs_car_id_idx ON car_specs(car_id);

  CREATE TABLE IF NOT EXISTS car_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    car_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    image_type TEXT NOT NULL DEFAULT 'general',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS car_images_car_id_idx ON car_images(car_id);

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    car_id INTEGER NOT NULL,
    booking_date TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
  );

  CREATE UNIQUE INDEX IF NOT EXISTS uniq_booking
    ON bookings(car_id, booking_date, time_slot)
    WHERE status NOT IN ('cancelled','completed');
`);

const ensureColumn = (tableName, columnName, definition) => {
  const columns = sqlite.prepare(`PRAGMA table_info(${tableName})`).all();
  if (!columns.some((column) => column.name === columnName)) {
    sqlite.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
};

for (const [columnName, definition] of [
  ['vin', 'TEXT'],
  ['make', 'TEXT'],
  ['model', 'TEXT'],
  ['type', 'TEXT'],
  ['category', 'TEXT'],
  ['mileage', 'INTEGER'],
  ['color', 'TEXT'],
  ['condition', 'TEXT'],
  ['updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
]) {
  ensureColumn('cars', columnName, definition);
}

for (const [columnName, definition] of [
  ['power', 'TEXT'],
  ['drive', 'TEXT'],
]) {
  ensureColumn('car_specs', columnName, definition);
}

// Postgres-style adapter so existing code keeps working
const db = {
  async query(text, params = []) {
    // Translate $1, $2 ... to ? placeholders
    const sql = text.replace(/\$\d+/g, '?');
    const trimmed = sql.trim().toUpperCase();

    try {
      if (trimmed.startsWith('SELECT') || trimmed.startsWith('WITH')) {
        const rows = sqlite.prepare(sql).all(...params);
        return { rows, rowCount: rows.length };
      }

      if (trimmed.startsWith('INSERT') || trimmed.startsWith('UPDATE') || trimmed.startsWith('DELETE')) {
        const hasReturning = /RETURNING/i.test(sql);
        if (hasReturning) {
          const rows = sqlite.prepare(sql).all(...params);
          return { rows, rowCount: rows.length };
        }
        const info = sqlite.prepare(sql).run(...params);
        return { rows: [], rowCount: info.changes, lastInsertRowid: info.lastInsertRowid };
      }

      sqlite.prepare(sql).run(...params);
      return { rows: [], rowCount: 0 };
    } catch (err) {
      console.error('SQL error:', err.message, '\nSQL:', sql);
      throw err;
    }
  },
  raw: sqlite
};

export default db;