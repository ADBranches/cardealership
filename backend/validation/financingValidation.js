import { MAX_TERM_MONTHS } from "../services/financingService.js";
const invalid = (
  v,
  { min = 0, max = Number.MAX_SAFE_INTEGER, integer = false } = {},
) =>
  typeof v !== "number" ||
  !Number.isFinite(v) ||
  v < min ||
  v > max ||
  (integer && !Number.isInteger(v));
export function calculationErrors(b = {}) {
  const d = {};
  if (invalid(b.carPrice, { min: 1 }))
    d.carPrice = "Vehicle price must be a valid positive number.";
  if (invalid(b.downPayment))
    d.downPayment = "Down payment must be a valid non-negative number.";
  if (invalid(b.interestRate, { max: 100 }))
    d.interestRate = "Interest rate must be between 0 and 100.";
  if (
    invalid(b.loanTermMonths, { min: 1, max: MAX_TERM_MONTHS, integer: true })
  )
    d.loanTermMonths = `Loan term must be a whole number between 1 and ${MAX_TERM_MONTHS}.`;
  if (!d.carPrice && !d.downPayment && b.downPayment >= b.carPrice)
    d.downPayment = "Down payment must be less than the vehicle price.";
  return Object.keys(d).length ? d : null;
}
export function leadErrors(b = {}) {
  const d = {};
  const f = b.financing || {};
  if (invalid(f.downPayment))
    d.downPayment = "Down payment must be a valid non-negative number.";
  if (invalid(f.interestRate, { max: 100 }))
    d.interestRate = "Interest rate must be between 0 and 100.";
  if (
    invalid(f.loanTermMonths, { min: 1, max: MAX_TERM_MONTHS, integer: true })
  )
    d.loanTermMonths = `Loan term must be a whole number between 1 and ${MAX_TERM_MONTHS}.`;
  if (!Number.isInteger(b.carId) || b.carId < 1)
    d.carId = "A valid vehicle is required.";
  if (
    typeof b.customerName !== "string" ||
    b.customerName.trim().length < 2 ||
    b.customerName.length > 160
  )
    d.customerName = "Enter your full name.";
  if (
    typeof b.customerPhone !== "string" ||
    !/^[+0-9 ()-]{7,40}$/.test(b.customerPhone.trim())
  )
    d.customerPhone = "Enter a valid phone number.";
  if (
    b.customerWhatsapp &&
    !/^[+0-9 ()-]{7,40}$/.test(b.customerWhatsapp.trim())
  )
    d.customerWhatsapp = "Enter a valid WhatsApp number.";
  if (
    b.customerEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.customerEmail.trim())
  )
    d.customerEmail = "Enter a valid email address.";
  if (b.contactConsent !== true) d.contactConsent = "Consent is required.";
  if (typeof b.idempotencyKey !== "string" || b.idempotencyKey.length < 16)
    d.idempotencyKey =
      "Unable to safely submit this request. Refresh and try again.";
  return Object.keys(d).length ? d : null;
}
