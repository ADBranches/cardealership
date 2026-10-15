// backend/controllers/adminController.js
import db from '../config/db.js';

// ============================================
// GET ADMIN STATS
// ============================================
export const getAdminStats = async (req, res) => {
  try {
    const carsResult = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status='available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status='sold' THEN 1 ELSE 0 END) as sold,
        SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status='rejected' THEN 1 ELSE 0 END) as rejected,
        AVG(price) as avg_price
      FROM cars
    `);

    const usersResult = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN role='admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role='user' THEN 1 ELSE 0 END) as regular,
        SUM(CASE WHEN created_at >= date('now','-7 days') THEN 1 ELSE 0 END) as new_this_week
      FROM users
    `);

    const bookingsResult = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status='confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN booking_date >= date('now','start of month') THEN 1 ELSE 0 END) as this_month,
        SUM(CASE WHEN booking_date >= date('now','-7 days') THEN 1 ELSE 0 END) as this_week
      FROM bookings
    `);

    const pendingResult = await db.query(
      `SELECT COUNT(*) as pending_bookings FROM bookings WHERE status='pending'`
    );

    const pendingCarsResult = await db.query(
      `SELECT COUNT(*) as pending_cars FROM cars WHERE status='pending'`
    );

    const popularCarsResult = await db.query(`
      SELECT c.id, c.name, c.brand, c.price,
             COUNT(b.id) as booking_count,
             SUM(CASE WHEN b.status='completed' THEN 1 ELSE 0 END) as completed_count
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

    const dailyBookingsResult = await db.query(`
      SELECT booking_date as date, COUNT(*) as bookings
      FROM bookings
      WHERE booking_date >= date('now', '-30 days')
      GROUP BY booking_date
      ORDER BY booking_date
    `);

    const topUsersResult = await db.query(`
      SELECT u.id, u.name, u.email, COUNT(b.id) as booking_count
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id
      GROUP BY u.id, u.name, u.email
      ORDER BY booking_count DESC
      LIMIT 5
    `);

    const conversionResult = await db.query(`
      SELECT
        COUNT(DISTINCT user_id) as users_with_bookings,
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed
      FROM bookings
    `);

    const totalUsers = +usersResult.rows[0].total || 0;
    const usersWithBookings = +conversionResult.rows[0].users_with_bookings || 0;
    const totalBookings = +conversionResult.rows[0].total_bookings || 0;
    const completedBookings = +conversionResult.rows[0].completed || 0;

    const conversionRate = totalUsers > 0
      ? ((usersWithBookings / totalUsers) * 100).toFixed(2)
      : '0.00';

    const completionRate = totalBookings > 0
      ? ((completedBookings / totalBookings) * 100).toFixed(2)
      : '0.00';

    res.json({
      success: true,
      stats: {
        cars: {
          total: +carsResult.rows[0].total || 0,
          available: +carsResult.rows[0].available || 0,
          sold: +carsResult.rows[0].sold || 0,
          pending: +carsResult.rows[0].pending || 0,
          rejected: +carsResult.rows[0].rejected || 0,
          avgPrice: Math.round(+carsResult.rows[0].avg_price || 0)
        },
        users: {
          total: totalUsers,
          admins: +usersResult.rows[0].admins || 0,
          regular: +usersResult.rows[0].regular || 0,
          newThisWeek: +usersResult.rows[0].new_this_week || 0
        },
        bookings: {
          total: totalBookings,
          pending: +bookingsResult.rows[0].pending || 0,
          confirmed: +bookingsResult.rows[0].confirmed || 0,
          completed: completedBookings,
          cancelled: +bookingsResult.rows[0].cancelled || 0,
          thisMonth: +bookingsResult.rows[0].this_month || 0,
          thisWeek: +bookingsResult.rows[0].this_week || 0
        },
        pendingApprovals: {
          bookings: +pendingResult.rows[0].pending_bookings || 0,
          cars: +pendingCarsResult.rows[0].pending_cars || 0,
          total: (+pendingResult.rows[0].pending_bookings || 0) + (+pendingCarsResult.rows[0].pending_cars || 0)
        },
        metrics: {
          conversionRate: +conversionRate,
          completionRate: +completionRate,
          usersWithBookings,
          avgBookingsPerUser: totalUsers > 0
            ? +(totalBookings / totalUsers).toFixed(2)
            : 0
        },
        popularCars: popularCarsResult.rows,
        topUsers: topUsersResult.rows,
        monthlyTrend: monthlyTrendResult.rows,
        dailyBookings: dailyBookingsResult.rows,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting admin stats:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ============================================
// EXPORT STATS AS CSV
// ============================================
export const exportStatsCSV = async (req, res) => {
  try {
    const bookings = await db.query(`
      SELECT b.id, u.name as user, u.email, c.name as car, c.brand,
             b.booking_date, b.time_slot, b.status, b.created_at
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN cars c ON b.car_id = c.id
      ORDER BY b.created_at DESC
    `);

    const header = 'id,user,email,car,brand,booking_date,time_slot,status,created_at\n';
    const rows = bookings.rows.map(r =>
      [r.id, r.user, r.email, r.car, r.brand, r.booking_date, r.time_slot, r.status, r.created_at]
        .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=bookings.csv');
    res.send(header + rows);
  } catch (error) {
    console.error('exportStatsCSV error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// GET BOOKINGS WITH FILTERS
// ============================================
export const getAllBookings = async (req, res) => {
  try {
    const { status, from, to, car_id, user_id, q } = req.query;
    const where = [];
    const params = [];

    if (status) { where.push('b.status = ?'); params.push(status); }
    if (from) { where.push('b.booking_date >= ?'); params.push(from); }
    if (to) { where.push('b.booking_date <= ?'); params.push(to); }
    if (car_id) { where.push('b.car_id = ?'); params.push(car_id); }
    if (user_id) { where.push('b.user_id = ?'); params.push(user_id); }
    if (q) {
      where.push('(u.name LIKE ? OR u.email LIKE ? OR c.name LIKE ?)');
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const result = await db.query(`
      SELECT b.*, u.name as user_name, u.email as user_email,
             c.name as car_name, c.brand as car_brand
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN cars c ON b.car_id = c.id
      ${whereSql}
      ORDER BY b.created_at DESC
      LIMIT 200
    `, params);

    res.json({ success: true, count: result.rows.length, bookings: result.rows });
  } catch (error) {
    console.error('getAllBookings error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// GET PENDING APPROVALS
// ============================================
export const getPendingApprovals = async (req, res) => {
  try {
    const bookingsResult = await db.query(`
      SELECT b.*, u.name as user_name, u.email as user_email,
             c.name as car_name, c.brand as car_brand
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN cars c ON b.car_id = c.id
      WHERE b.status = 'pending'
      ORDER BY b.created_at ASC
    `);

    const carsResult = await db.query(`
      SELECT * FROM cars WHERE status = 'pending' ORDER BY created_at ASC
    `);

    res.json({
      success: true,
      pendingBookings: bookingsResult.rows,
      pendingCars: carsResult.rows,
      totalPending: bookingsResult.rows.length + carsResult.rows.length
    });
  } catch (error) {
    console.error('getPendingApprovals error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// UPDATE BOOKING STATUS
// ============================================
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
    console.error('updateBookingStatus error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// BULK UPDATE BOOKINGS
// ============================================
export const bulkUpdateBookings = async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'ids array required' });
    }
    const allowed = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const placeholders = ids.map(() => '?').join(',');
    const result = await db.query(
      `UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id IN (${placeholders}) RETURNING id`,
      [status, ...ids]
    );
    res.json({ success: true, updatedIds: result.rows.map(r => r.id) });
  } catch (error) {
    console.error('bulkUpdateBookings error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// APPROVE CAR
// ============================================
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

// ============================================
// REJECT CAR
// ============================================
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

// ============================================
// UPDATE CAR
// ============================================
export const updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brand, price, year, status, description, image_url } = req.body;

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

// ============================================
// DELETE CAR
// ============================================
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