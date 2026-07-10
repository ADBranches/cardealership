import {
  EMAIL_PROVIDER,
  getEmailConfig,
  getRequiredEmailEnvironmentKeys,
} from "../config/email.js";

/**
 * Transaction confirmation notification payload.
 *
 * Expected shape:
 *
 * {
 *   to: "customer@example.com",
 *   customerName: "Customer Name",
 *   vehicleName: "Toyota Land Cruiser",
 *   vehicleId: "123",
 *   appointmentDate: "2026-07-15",
 *   appointmentTime: "10:00",
 *   reference: "TD-12345",
 *   dealershipName: "Panda Motors",
 *   dealershipPhone: "+256 770 826 951"
 * }
 */

export function validateAppointmentNotificationPayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== "object") {
    return ["Notification payload is required."];
  }

  if (!payload.to || typeof payload.to !== "string") {
    errors.push("Recipient email is required.");
  }

  if (!payload.customerName || typeof payload.customerName !== "string") {
    errors.push("Customer name is required.");
  }

  if (!payload.vehicleName && !payload.vehicleId) {
    errors.push("Vehicle name or vehicle ID is required.");
  }

  if (!payload.appointmentDate || typeof payload.appointmentDate !== "string") {
    errors.push("Appointment date is required.");
  }

  if (!payload.appointmentTime || typeof payload.appointmentTime !== "string") {
    errors.push("Appointment time is required.");
  }

  return errors;
}

export function buildAppointmentConfirmationMessage(payload) {
  const vehicleLabel = payload.vehicleName || `Vehicle ID ${payload.vehicleId}`;
  const dealershipName = payload.dealershipName || "the dealership team";
  const dealershipPhone = payload.dealershipPhone || "the dealership contact line";
  const referenceLine = payload.reference
    ? `Confirmation reference: ${payload.reference}`
    : "Confirmation reference: pending assignment";

  return {
    subject: `Test drive appointment confirmed for ${vehicleLabel}`,
    text: [
      `Hello ${payload.customerName},`,
      "",
      `Your appointment for ${vehicleLabel} has been confirmed.`,
      `Date: ${payload.appointmentDate}`,
      `Time: ${payload.appointmentTime}`,
      referenceLine,
      "",
      `${dealershipName} will contact you if any additional details are needed.`,
      `Contact: ${dealershipPhone}`,
      "",
      "Thank you for choosing us.",
    ].join("\n"),
  };
}

/**
 * Phase 1 contract function.
 *
 * This function validates the payload and prepares the message, but it does
 * not send outbound email until the team confirms the provider configuration.
 */
export async function sendAppointmentConfirmationEmail(payload) {
  const validationErrors = validateAppointmentNotificationPayload(payload);

  if (validationErrors.length > 0) {
    return {
      sent: false,
      skipped: true,
      reason: "Invalid notification payload.",
      errors: validationErrors,
    };
  }

  const message = buildAppointmentConfirmationMessage(payload);
  const emailConfig = getEmailConfig();

  if (EMAIL_PROVIDER === "pending") {
    return {
      sent: false,
      skipped: true,
      reason: "Email provider is not configured yet.",
      requiredEnvironmentKeys: getRequiredEmailEnvironmentKeys(),
      provider: EMAIL_PROVIDER,
      message,
    };
  }

  return {
    sent: false,
    skipped: true,
    reason: "Provider transport is not implemented in Phase 1.",
    provider: EMAIL_PROVIDER,
    config: emailConfig,
    message,
  };
}
