import {
  sendAppointmentConfirmationEmail,
  validateAppointmentNotificationPayload,
  buildAppointmentConfirmationMessage,
  getNotificationServiceStatus,
} from "../services/notificationService.js";

const validPayload = {
  to: "customer@example.com",
  customerName: "Customer Name",
  vehicleName: "Toyota Land Cruiser",
  appointmentDate: "2026-07-15",
  appointmentTime: "10:00",
  reference: "TD-12345",
  dealershipName: "Panda Motors",
  dealershipPhone: "+256 770 826 951",
};

const missingEmailPayload = {
  customerName: "Customer Name",
  vehicleName: "Toyota Land Cruiser",
  appointmentDate: "2026-07-15",
  appointmentTime: "10:00",
};

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    failed += 1;
    console.error(`FAILED: ${message}`);
  } else {
    console.log(`PASSED: ${message}`);
  }
}

const validationErrors = validateAppointmentNotificationPayload(validPayload);
assert(
  validationErrors.length === 0,
  "valid notification payload has no validation errors"
);

const missingEmailErrors =
  validateAppointmentNotificationPayload(missingEmailPayload);
assert(
  missingEmailErrors.includes("A valid recipient email is required."),
  "missing recipient email is handled safely"
);

const message = buildAppointmentConfirmationMessage(validPayload);
assert(Boolean(message.subject), "notification subject is generated");
assert(Boolean(message.text), "notification text body is generated");
assert(Boolean(message.html), "notification HTML body is generated");
assert(
  !JSON.stringify(message).includes("JWT") &&
    !JSON.stringify(message).includes("TOKEN") &&
    !JSON.stringify(message).includes("password"),
  "notification message does not expose token or password fields"
);

const serviceStatus = getNotificationServiceStatus();
assert(Boolean(serviceStatus.provider), "notification service status is available");
assert(
  serviceStatus.config &&
    serviceStatus.config.sendgrid &&
    serviceStatus.config.nodemailer,
  "notification status exposes redacted provider readiness only"
);

const sendResult = await sendAppointmentConfirmationEmail(validPayload);
assert(sendResult.sent === false, "manual service test does not send real email");
assert(
  sendResult.skipped === true,
  "manual service test safely skips when provider transport is unavailable"
);
assert(
  !JSON.stringify(sendResult).includes("SENDGRID_API_KEY") &&
    !JSON.stringify(sendResult).includes("EMAIL_PASSWORD"),
  "service response does not expose provider secrets"
);

const invalidSendResult =
  await sendAppointmentConfirmationEmail(missingEmailPayload);
assert(
  invalidSendResult.sent === false,
  "invalid notification payload is not sent"
);
assert(
  invalidSendResult.errors.includes("A valid recipient email is required."),
  "invalid notification payload returns safe validation error"
);

if (failed > 0) {
  console.error(`${failed} notification test(s) failed.`);
  process.exit(1);
}

console.log("All notification service manual tests passed.");
