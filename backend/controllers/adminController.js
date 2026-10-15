// backend/controllers/adminController.js
import db from '../config/db.js';

export const getAdminStats = async (req, res) => {
  try {
    const carsResult = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status='available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status='sold' THEN 1 ELSE 0 END) as sold,
        SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending
      FROM cars
    `);

    const usersResult = await db.query(`SELECT COUNT(*) as total FROM users`);

    const bookingsResult = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status='confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM bookings
    `);

    const pendingResult = await db.query(
      `SELECT COUNT(*) as pending_bookings FROM bookings WHERE status='pending'`
    );

    const popularCarsResult = await db.query(`
      SELECT c.id, c.name, c.brand, c.price, COUNT(b.id) as booking_count
      FROM cars c
      LEFT JOIN bookings b ON c.id = b.car_id
      GROUP BY c.id, c.name, c.brand, c.price
      ORDER BY booking_count DESC
      LIMIT 5
    `);

    const monthlyTrendResult = await db.query(`
      SELECT strftime('%Y-%m', booking_date) as month, COUNT(*) as bookings
      FROM bookings
      WHERE booking_date >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', booking_date)
      ORDER BY month
    `);

    res.json({
      success: true,
      stats: {
        cars: {
          total: +carsResult.rows[0].total || 0,
          available: +carsResult.rows[0].available || 0,
          sold: +carsResult.rows[0].sold || 0,
          pending: +carsResult.rows[0].pending || 0
        },
        users: { total: +usersResult.rows[0].total || 0 },
        bookings: {
          total: +bookingsResult.rows[0].total || 0,
          pending: +bookingsResult.rows[0].pending || 0,
          confirmed: +bookingsResult.rows[0].confirmed || 0,
          completed: +bookingsResult.rows[0].completed || 0,
          cancelled: +bookingsResult.rows[0].cancelled || 0
        },
        pendingApprovals: {
          bookings: +pendingResult.rows[0].pending_bookings || 0
        },
        popularCars: popularCarsResult.rows,
        monthlyTrend: monthlyTrendResult.rows,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting admin stats:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getPendingApprovals = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT b.*, u.name as user_name, u.email as user_email,
             c.name as car_name, c.brand as car_brand
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN cars c ON b.car_id = c.id
      WHERE b.status = 'pending'
      ORDER BY b.created_at ASC
    `);
    res.json({
      success: true,
      pendingBookings: result.rows,
      pendingCars: [],
      totalPending: result.rows.length
    });
  } catch (error) {
    console.error('Error getting pending approvals:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT b.*, u.name as user_name, u.email as user_email,
             c.name as car_name, c.brand as car_brand
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN cars c ON b.car_id = c.id
      ORDER BY b.created_at DESC
      LIMIT 100
    `);
    res.json({ success: true, count: result.rows.length, bookings: result.rows });
  } catch (error) {
    console.error('Error getting all bookings:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const result = await db.query(
      `UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? RETURNING *`,
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, booking: result.rows[0] });
  } catch (error) {
    console.error('Error updating booking status:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const bulkUpdateBookings = async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'ids array required' });
    }
    const placeholders = ids.map(() => '?').join(',');
    const result = await db.query(
      `UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id IN (${placeholders}) RETURNING id`,
      [status, ...ids]
    );
    res.json({ success: true, updatedIds: result.rows.map(r => r.id) });
  } catch (error) {
    console.error('Error bulk updating:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const approveCar = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `UPDATE cars SET status = 'available' WHERE id = ? RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }
    res.json({ success: true, car: result.rows[0] });
  } catch (error) {
    console.error('approveCar error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const rejectCar = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `UPDATE cars SET status = 'rejected' WHERE id = ? RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }
    res.json({ success: true, car: result.rows[0] });
  } catch (error) {
    console.error('rejectCar error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brand, price, year, status, description, image_url } = req.body;

    // Fetch current
    const current = await db.query('SELECT * FROM cars WHERE id = ?', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }
    const c = current.rows[0];

    const result = await db.query(
      `UPDATE cars
       SET name = ?, brand = ?, price = ?, year = ?, status = ?, description = ?, image_url = ?
       WHERE id = ?
       RETURNING *`,
      [
        name ?? c.name,
        brand ?? c.brand,
        price ?? c.price,
        year ?? c.year,
        status ?? c.status,
        description ?? c.description,
        image_url ?? c.image_url,
        id
      ]
    );
    res.json({ success: true, car: result.rows[0] });
  } catch (error) {
    console.error('updateCar error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM cars WHERE id = ? RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }
    res.json({ success: true, car: result.rows[0] });
  } catch (error) {
    console.error('deleteCar error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};