import { sendAppointmentConfirmationEmail } from "../services/notificationService.js";

function buildReference() {
  return `TD-${Date.now()}`;
}

function getRequiredString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateTestDrivePayload(payload) {
  const errors = [];

  const customerName = getRequiredString(payload.customerName || payload.name);
  const customerEmail = getRequiredString(payload.customerEmail || payload.email);
  const vehicleName = getRequiredString(payload.vehicleName);
  const vehicleId = getRequiredString(payload.vehicleId);
  const appointmentDate = getRequiredString(payload.appointmentDate || payload.date);
  const appointmentTime = getRequiredString(payload.appointmentTime || payload.time);

  if (!customerName) {
    errors.push("Customer name is required.");
  }

  if (!customerEmail) {
    errors.push("Customer email is required.");
  }

  if (!vehicleName && !vehicleId) {
    errors.push("Vehicle name or vehicle ID is required.");
  }

  if (!appointmentDate) {
    errors.push("Appointment date is required.");
  }

  if (!appointmentTime) {
    errors.push("Appointment time is required.");
  }

  return {
    errors,
    normalized: {
      customerName,
      customerEmail,
      vehicleName,
      vehicleId,
      appointmentDate,
      appointmentTime,
      phone: getRequiredString(payload.phone),
      notes: getRequiredString(payload.notes),
    },
  };
}

/**
 * POST /api/test-drives
 *
 * Sprint 3 Edwin integration point:
 * - Validate appointment payload.
 * - Confirm schedule log at controller level for now.
 * - Trigger transactional notification service after confirmation.
 *
 * TODO:
 * Replace the local confirmation object with Max/team-confirmed booking
 * persistence once the booking schema and conflict logic are finalized.
 */
export async function confirmTestDriveBooking(req, res) {
  const { errors, normalized } = validateTestDrivePayload(req.body || {});

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid test-drive booking request.",
      errors,
    });
  }

  const confirmedBooking = {
    reference: buildReference(),
    status: "confirmed",
    customerName: normalized.customerName,
    customerEmail: normalized.customerEmail,
    vehicleName: normalized.vehicleName,
    vehicleId: normalized.vehicleId,
    appointmentDate: normalized.appointmentDate,
    appointmentTime: normalized.appointmentTime,
  };

  let notificationResult = {
    attempted: false,
    sent: false,
    skipped: true,
    message: "Notification was not attempted.",
  };

  try {
    const result = await sendAppointmentConfirmationEmail({
      to: confirmedBooking.customerEmail,
      customerName: confirmedBooking.customerName,
      vehicleName: confirmedBooking.vehicleName,
      vehicleId: confirmedBooking.vehicleId,
      appointmentDate: confirmedBooking.appointmentDate,
      appointmentTime: confirmedBooking.appointmentTime,
      reference: confirmedBooking.reference,
      dealershipName: "Panda Motors",
      dealershipPhone: "+256 770 826 951",
    });

    notificationResult = {
      attempted: true,
      sent: result.sent === true,
      skipped: result.skipped === true,
      provider: result.provider,
      reason: result.reason || "Notification service completed.",
    };
  } catch (error) {
    console.error("Appointment notification dispatch failed:", error.message);

    notificationResult = {
      attempted: true,
      sent: false,
      skipped: true,
      reason: "Appointment was confirmed, but notification dispatch failed.",
    };
  }

  return res.status(201).json({
    success: true,
    message: "Test-drive appointment confirmed.",
    booking: confirmedBooking,
    notification: notificationResult,
  });
}
