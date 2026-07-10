function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getVehicleLabel(payload) {
  if (payload.vehicleName) {
    return payload.vehicleName;
  }

  return "your selected vehicle";
}

function getReferenceLine(reference) {
  if (!reference) {
    return "Confirmation reference: pending assignment";
  }

  return `Confirmation reference: ${reference}`;
}

export function buildAppointmentConfirmationTemplate(payload) {
  const customerName = payload.customerName || "there";
  const vehicleLabel = getVehicleLabel(payload);
  const appointmentDate = payload.appointmentDate || "the selected date";
  const appointmentTime = payload.appointmentTime || "the selected time";
  const dealershipName = payload.dealershipName || "the dealership team";
  const dealershipPhone =
    payload.dealershipPhone || "the dealership contact line";
  const referenceLine = getReferenceLine(payload.reference);

  const subject = `Test drive appointment confirmed for ${vehicleLabel}`;

  const text = [
    `Hello ${customerName},`,
    "",
    `Your appointment for ${vehicleLabel} has been confirmed.`,
    `Date: ${appointmentDate}`,
    `Time: ${appointmentTime}`,
    referenceLine,
    "",
    `${dealershipName} will contact you if any additional details are needed.`,
    `Contact: ${dealershipPhone}`,
    "",
    "Thank you for choosing us.",
  ].join("\n");

  const html = [
    "<div>",
    `  <p>Hello ${escapeHtml(customerName)},</p>`,
    "  <p>",
    `    Your appointment for <strong>${escapeHtml(vehicleLabel)}</strong> has been confirmed.`,
    "  </p>",
    "  <ul>",
    `    <li><strong>Date:</strong> ${escapeHtml(appointmentDate)}</li>`,
    `    <li><strong>Time:</strong> ${escapeHtml(appointmentTime)}</li>`,
    `    <li><strong>${escapeHtml(referenceLine)}</strong></li>`,
    "  </ul>",
    `  <p>${escapeHtml(dealershipName)} will contact you if any additional details are needed.</p>`,
    `  <p>Contact: ${escapeHtml(dealershipPhone)}</p>`,
    "  <p>Thank you for choosing us.</p>",
    "</div>",
  ].join("\n");

  return {
    to: payload.to,
    subject,
    text,
    html,
  };
}
