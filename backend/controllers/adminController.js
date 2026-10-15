// backend/controllers/adminController.js
import pool from '../config/db.js';

export const getAdminStats = async (req, res) => {
  try {
    const [carsResult, usersResult, bookingsResult, pendingResult, popularCarsResult, monthlyTrendResult] = await Promise.all([
      pool.query(`SELECT COUNT(*) total, COUNT(CASE WHEN status='available' THEN 1 END) available, COUNT(CASE WHEN status='sold' THEN 1 END) sold FROM cars`),
      pool.query(`SELECT COUNT(*) total FROM users`),
      pool.query(`SELECT COUNT(*) total, COUNT(CASE WHEN status='pending' THEN 1 END) pending, COUNT(CASE WHEN status='confirmed' THEN 1 END) confirmed, COUNT(CASE WHEN status='completed' THEN 1 END) completed, COUNT(CASE WHEN status='cancelled' THEN 1 END) cancelled FROM bookings`),
      pool.query(`SELECT COUNT(*) as pending_bookings FROM bookings WHERE status='pending'`),
      pool.query(`SELECT c.id, c.name, c.brand, c.price, COUNT(b.id) booking_count FROM cars c LEFT JOIN bookings b ON c.id = b.car_id GROUP BY c.id ORDER BY booking_count DESC LIMIT 5`),
      pool.query(`SELECT TO_CHAR(DATE_TRUNC('month', booking_date),'YYYY-MM') month, COUNT(*) bookings FROM bookings WHERE booking_date >= CURRENT_DATE - INTERVAL '6 months' GROUP BY DATE_TRUNC('month', booking_date) ORDER BY month`)
    ]);

    res.json({
      success: true,
      stats: {
        cars: { total: +carsResult.rows[0].total, available: +carsResult.rows[0].available, sold: +carsResult.rows[0].sold },
        users: { total: +usersResult.rows[0].total },
        bookings: {
          total: +bookingsResult.rows[0].total,
          pending: +bookingsResult.rows[0].pending,
          confirmed: +bookingsResult.rows[0].confirmed,
          completed: +bookingsResult.rows[0].completed,
          cancelled: +bookingsResult.rows[0].cancelled
        },
        pendingApprovals: { bookings: +pendingResult.rows[0].pending_bookings },
        popularCars: popularCarsResult.rows,
        monthlyTrend: monthlyTrendResult.rows,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getPendingApprovals = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, u.name user_name, u.email user_email, c.name car_name, c.brand car_brand
       FROM bookings b JOIN users u ON b.user_id=u.id JOIN cars c ON b.car_id=c.id
       WHERE b.status='pending' ORDER BY b.created_at ASC`
    );
    res.json({ success: true, pendingBookings: result.rows, pendingCars: [], totalPending: result.rows.length });
  } catch (error) {
    console.error('Error getting pending approvals:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, u.name user_name, u.email user_email, c.name car_name, c.brand car_brand
       FROM bookings b JOIN users u ON b.user_id=u.id JOIN cars c ON b.car_id=c.id
       ORDER BY b.created_at DESC LIMIT 100`
    );
    res.json({ success: true, count: result.rows.length, bookings: result.rows });
  } catch (error) {
    console.error('Error getting all bookings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query(
      `UPDATE bookings SET status=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *`,
      [status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking: result.rows[0] });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const bulkUpdateBookings = async (req, res) => {
  try {
    const { ids, status } = req.body;
    const result = await pool.query(
      `UPDATE bookings SET status=$1, updated_at=CURRENT_TIMESTAMP WHERE id = ANY($2::int[]) RETURNING id`,
      [status, ids]
    );
    res.json({ success: true, updatedIds: result.rows.map(r => r.id) });
  } catch (error) {
    console.error('Error bulk updating:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const approveCar = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`UPDATE cars SET status='available' WHERE id=$1 RETURNING *`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Car not found' });
    res.json({ success: true, car: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const rejectCar = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`UPDATE cars SET status='rejected' WHERE id=$1 RETURNING *`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Car not found' });
    res.json({ success: true, car: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brand, price, year, status } = req.body;
    const result = await pool.query(
      `UPDATE cars SET name=COALESCE($1,name), brand=COALESCE($2,brand), price=COALESCE($3,price), year=COALESCE($4,year), status=COALESCE($5,status) WHERE id=$6 RETURNING *`,
      [name, brand, price, year, status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Car not found' });
    res.json({ success: true, car: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM cars WHERE id=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Car not found' });
    res.json({ success: true, car: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};