import {
  getEmailConfig,
  getEmailProvider,
  getRedactedEmailConfig,
  getRequiredEmailEnvironmentKeys,
  isEmailProviderConfigured,
} from "../config/email.js";

function isValidEmail(value) {
  if (!value || typeof value !== "string") {
    return false;
  }

  const atIndex = value.indexOf("@");
  const dotIndex = value.lastIndexOf(".");
  return atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < value.length - 1;
}

export function validateAppointmentNotificationPayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== "object") {
    return ["Notification payload is required."];
  }

  if (!isValidEmail(payload.to)) {
    errors.push("A valid recipient email is required.");
  }

  if (!payload.customerName || typeof payload.customerName !== "string") {
    errors.push("Customer name is required.");
  }

  if (!payload.vehicleName) {
    if (!payload.vehicleId) {
      errors.push("Vehicle name or vehicle ID is required.");
    }
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
  const vehicleLabel = payload.vehicleName || "Vehicle ID " + payload.vehicleId;
  const dealershipName = payload.dealershipName || "the dealership team";
  const dealershipPhone = payload.dealershipPhone || "the dealership contact line";
  const referenceLine = payload.reference
    ? "Confirmation reference: " + payload.reference
    : "Confirmation reference: pending assignment";

  const messageText = [
    "Hello " + payload.customerName + ",",
    "",
    "Your appointment for " + vehicleLabel + " has been confirmed.",
    "Date: " + payload.appointmentDate,
    "Time: " + payload.appointmentTime,
    referenceLine,
    "",
    "For questions or changes, contact " + dealershipName + " on " + dealershipPhone + ".",
    "",
    "Thank you."
  ].join(String.fromCharCode(10));

  return {
    to: payload.to,
    subject: "Test drive appointment confirmed for " + vehicleLabel,
    text: messageText,
    html: messageText
  };
}

export function getNotificationServiceStatus() {
  return {
    provider: getEmailProvider(),
    configured: isEmailProviderConfigured(),
    requiredEnvironmentKeys: getRequiredEmailEnvironmentKeys(),
    config: getRedactedEmailConfig(),
  };
}

export async function sendAppointmentConfirmationEmail(payload) {
  const errors = validateAppointmentNotificationPayload(payload);

  if (errors.length > 0) {
    return {
      sent: false,
      skipped: false,
      errors,
    };
  }

  const message = buildAppointmentConfirmationMessage(payload);
  const provider = getEmailProvider();
  const configured = isEmailProviderConfigured();

  if (!configured) {
    return {
      sent: false,
      skipped: true,
      provider,
      reason: "Email provider is not configured.",
      requiredEnvironmentKeys: getRequiredEmailEnvironmentKeys(),
      message,
    };
  }

  const config = getEmailConfig();

  return {
    sent: false,
    skipped: true,
    provider,
    reason: "Outbound email transport is not connected yet. Message was built and validated successfully.",
    config: getRedactedEmailConfig(),
    message,
    transportReady: Boolean(config),
  };
}
