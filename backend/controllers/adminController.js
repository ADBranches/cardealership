import pool from "../config/db.js";
import { canTransitionBooking, isBookingStatus } from "../utils/bookingTransitions.js";

function sendError(res, status, code, message) {
  return res.status(status).json({ success: false, code, message });
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function getAdminStats(req, res) {
  try {
    const [cars, users, bookings, pendingBookings, pendingListings] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS count FROM cars"),
      pool.query("SELECT COUNT(*)::int AS count FROM users"),
      pool.query("SELECT COUNT(*)::int AS count FROM bookings"),
      pool.query("SELECT COUNT(*)::int AS count FROM bookings WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*)::int AS count FROM cars WHERE LOWER(status) = 'pending'"),
    ]);
    return res.status(200).json({
      success: true,
      stats: {
        totalCars: cars.rows[0].count,
        inventoryCount: cars.rows[0].count,
        totalUsers: users.rows[0].count,
        totalBookings: bookings.rows[0].count,
        pendingBookings: pendingBookings.rows[0].count,
        pendingListings: pendingListings.rows[0].count,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Admin stats failed:", error);
    return sendError(res, 500, "ADMIN_STATS_FAILED", "Admin statistics could not be loaded.");
  }
}

export async function getAllUsers(req, res) {
  try {
    const result = await pool.query("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC");
    return res.status(200).json({ success: true, data: result.rows, total: result.rowCount });
  } catch (error) {
    console.error("Admin users failed:", error);
    return sendError(res, 500, "ADMIN_USERS_FAILED", "Users could not be loaded.");
  }
}

export async function getAllBookings(req, res) {
  try {
    const result = await pool.query(`
      SELECT b.*, u.name AS user_name, u.email AS user_email,
             c.make, c.model, c.year
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN cars c ON b.car_id = c.id
      ORDER BY b.created_at DESC
    `);
    return res.status(200).json({ success: true, bookings: result.rows, data: result.rows, total: result.rowCount });
  } catch (error) {
    console.error("Admin bookings failed:", error);
    return sendError(res, 500, "ADMIN_BOOKINGS_FAILED", "Bookings could not be loaded.");
  }
}

export async function updateBookingStatus(req, res) {
  const id = parseId(req.params.id);
  const status = typeof req.body.status === "string" ? req.body.status.toLowerCase() : "";
  const expectedUpdatedAt = req.body.expectedUpdatedAt;
  if (!id) return sendError(res, 400, "VALIDATION_FAILED", "A valid booking ID is required.");
  if (!isBookingStatus(status)) return sendError(res, 400, "VALIDATION_FAILED", "Unsupported booking status.");
  try {
    const current = await pool.query("SELECT * FROM bookings WHERE id = $1 LIMIT 1", [id]);
    if (current.rowCount === 0) return sendError(res, 404, "BOOKING_NOT_FOUND", "Booking was not found.");
    const booking = current.rows[0];
    if (!canTransitionBooking(booking.status, status)) {
      return sendError(res, 409, "INVALID_TRANSITION", `Booking cannot move from ${booking.status} to ${status}.`);
    }
    if (expectedUpdatedAt && new Date(booking.updated_at).toISOString() !== new Date(expectedUpdatedAt).toISOString()) {
      return sendError(res, 409, "STALE_STATE", "Booking changed on the server. Refresh and try again.");
    }
    const updated = await pool.query(
      "UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [status, id],
    );
    return res.status(200).json({ success: true, message: "Booking status updated.", booking: updated.rows[0] });
  } catch (error) {
    console.error("Admin booking update failed:", error);
    return sendError(res, 500, "BOOKING_UPDATE_FAILED", "Booking status could not be updated.");
  }
}

export async function getPendingApprovals(req, res) {
  try {
    const result = await pool.query("SELECT * FROM cars WHERE LOWER(status) = 'pending' ORDER BY created_at DESC");
    return res.status(200).json({ success: true, data: result.rows, total: result.rowCount });
  } catch (error) {
    console.error("Pending listing load failed:", error);
    return sendError(res, 500, "PENDING_LISTINGS_FAILED", "Pending listings could not be loaded.");
  }
}

export async function getAllCars(req, res) {
  try {
    const result = await pool.query("SELECT * FROM cars ORDER BY created_at DESC");
    return res.status(200).json({ success: true, data: result.rows, total: result.rowCount });
  } catch (error) {
    console.error("Admin cars failed:", error);
    return sendError(res, 500, "ADMIN_CARS_FAILED", "Cars could not be loaded.");
  }
}

export async function approveVehicle(req, res) {
  const id = parseId(req.params.id);
  if (!id) return sendError(res, 400, "VALIDATION_FAILED", "A valid listing ID is required.");
  try {
    const result = await pool.query(
      "UPDATE cars SET status = 'approved', approved_at = NOW(), rejection_reason = NULL, updated_at = NOW() WHERE id = $1 AND LOWER(status) = 'pending' RETURNING *",
      [id],
    );
    if (result.rowCount === 0) return sendError(res, 404, "LISTING_NOT_FOUND", "Pending listing was not found.");
    return res.status(200).json({ success: true, message: "Listing approved.", data: result.rows[0] });
  } catch (error) {
    console.error("Listing approval failed:", error);
    return sendError(res, 500, "LISTING_APPROVAL_FAILED", "Listing could not be approved.");
  }
}

export async function rejectVehicle(req, res) {
  const id = parseId(req.params.id);
  const reason = typeof req.body.reason === "string" ? req.body.reason.trim() : "";
  if (!id) return sendError(res, 400, "VALIDATION_FAILED", "A valid listing ID is required.");
  if (reason.length < 5 || reason.length > 500) return sendError(res, 400, "VALIDATION_FAILED", "Rejection reason must be 5 to 500 characters.");
  try {
    const result = await pool.query(
      "UPDATE cars SET status = 'rejected', rejection_reason = $1, approved_at = NULL, updated_at = NOW() WHERE id = $2 AND LOWER(status) = 'pending' RETURNING *",
      [reason, id],
    );
    if (result.rowCount === 0) return sendError(res, 404, "LISTING_NOT_FOUND", "Pending listing was not found.");
    return res.status(200).json({ success: true, message: "Listing rejected.", data: result.rows[0] });
  } catch (error) {
    console.error("Listing rejection failed:", error);
    return sendError(res, 500, "LISTING_REJECTION_FAILED", "Listing could not be rejected.");
  }
}
