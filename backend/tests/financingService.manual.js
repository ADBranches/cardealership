import assert from "node:assert/strict";
import { calculateFinancing } from "../services/financingService.js";
import {
  calculationErrors,
  leadErrors,
} from "../validation/financingValidation.js";

const zero = calculateFinancing({
  carPrice: 1000000,
  downPayment: 200000,
  interestRate: 0,
  loanTermMonths: 4,
});
assert.equal(zero.loanAmount, 800000);
assert.equal(zero.monthlyPayment, 200000);
assert.equal(zero.totalInterest, 0);
assert.equal(zero.paymentSchedule.length, 4);
assert.equal(zero.paymentSchedule[3].remainingBalance, 0);
const interest = calculateFinancing({
  carPrice: 80000000,
  downPayment: 10000000,
  interestRate: 18,
  loanTermMonths: 48,
});
assert.equal(interest.loanAmount, 70000000);
assert.equal(interest.paymentSchedule.length, 6);
assert.ok(interest.monthlyPayment > 0);
assert.ok(interest.totalInterest > 0);
assert.ok(
  calculationErrors({
    carPrice: "80000000abc",
    downPayment: 0,
    interestRate: 1,
    loanTermMonths: 24,
  }),
);
assert.ok(
  calculationErrors({
    carPrice: 1,
    downPayment: 0,
    interestRate: 1,
    loanTermMonths: 24.5,
  }),
);
assert.ok(
  calculationErrors({
    carPrice: 1,
    downPayment: 1,
    interestRate: 1,
    loanTermMonths: 24,
  }),
);
assert.ok(
  leadErrors({
    carId: 0,
    customerName: "A",
    customerPhone: "bad",
    contactConsent: false,
    idempotencyKey: "small",
    financing: {},
  }),
);
console.log("financingService.manual: 10 assertions passed");
