// backend/models/Booking.js
import pool from '../config/db.js';

const BookingModel = {
  async isCarAvailable(carId, bookingDate, timeSlot) {
    const result = await pool.query(
      `SELECT COUNT(*) count FROM bookings WHERE car_id=$1 AND booking_date=$2 AND time_slot=$3
       AND status NOT IN ('cancelled','completed')`,
      [carId, bookingDate, timeSlot]
    );
    return parseInt(result.rows[0].count) === 0;
  },
  async getCarBookingsForDate(carId, date) {
    const result = await pool.query(
      `SELECT * FROM bookings WHERE car_id=$1 AND booking_date=$2 AND status NOT IN ('cancelled','completed') ORDER BY time_slot`,
      [carId, date]
    );
    return result.rows;
  }
};

export default BookingModel;