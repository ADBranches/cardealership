// backend/seed.js
import db from './config/db.js';

const cars = [
  ['Land Cruiser V8', 'Toyota', 285000000, 2023, 'available', 'Luxury SUV, 4.5L V8'],
  ['S-Class S500', 'Mercedes-Benz', 360000000, 2023, 'available', 'Luxury sedan'],
  ['Range Rover Sport', 'Land Rover', 420000000, 2023, 'available', 'Sport luxury SUV'],
  ['X5 xDrive40i', 'BMW', 195000000, 2023, 'available', 'Sports SUV'],
  ['Land Cruiser Prado TZ', 'Toyota', 168000000, 2022, 'available', 'Premium SUV'],
  ['LX 570', 'Lexus', 390000000, 2023, 'available', 'Ultra luxury SUV'],
  ['Civic', 'Honda', 95000000, 2022, 'pending', 'Compact sedan'],
  ['Model 3', 'Tesla', 220000000, 2023, 'sold', 'Electric sedan']
];

for (const c of cars) {
  await db.query(
    `INSERT INTO cars (name, brand, price, year, status, description) VALUES (?, ?, ?, ?, ?, ?)`,
    c
  );
}

const bookings = [
  [1, 1, '2026-10-20', '10:00-11:00', 'pending'],
  [2, 2, '2026-10-21', '11:00-12:00', 'confirmed'],
  [1, 3, '2026-10-22', '14:00-15:00', 'completed'],
  [2, 4, '2026-10-23', '15:00-16:00', 'pending'],
  [1, 5, '2026-10-24', '09:00-10:00', 'cancelled'],
  [2, 6, '2026-11-01', '16:00-17:00', 'confirmed'],
  [1, 1, '2026-11-05', '10:00-11:00', 'completed'],
  [2, 2, '2026-11-10', '12:00-13:00', 'pending']
];

for (const b of bookings) {
  await db.query(
    `INSERT INTO bookings (user_id, car_id, booking_date, time_slot, status)
     VALUES (?, ?, ?, ?, ?)`,
    b
  );
}

console.log('Seed complete.');
process.exit(0);