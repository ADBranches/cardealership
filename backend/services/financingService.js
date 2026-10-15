export const MAX_TERM_MONTHS = 120;
export function calculateFinancing({
  carPrice,
  downPayment,
  interestRate,
  loanTermMonths,
}) {
  const loanAmount = carPrice - downPayment;
  const rate = interestRate / 1200;
  const raw =
    rate === 0
      ? loanAmount / loanTermMonths
      : (loanAmount * (rate * (1 + rate) ** loanTermMonths)) /
        ((1 + rate) ** loanTermMonths - 1);
  const monthlyPayment = Math.round(raw),
    totalPayment = Math.round(raw * loanTermMonths),
    totalInterest = Math.max(0, totalPayment - loanAmount),
    paymentSchedule = [];
  let balance = loanAmount;
  for (let month = 1; month <= Math.min(6, loanTermMonths); month += 1) {
    const interest = balance * rate,
      principal = rate === 0 ? raw : raw - interest;
    balance = Math.max(0, balance - principal);
    paymentSchedule.push({
      month,
      payment: monthlyPayment,
      principal: Math.round(principal),
      interest: Math.round(interest),
      remainingBalance: Math.round(balance),
    });
  }
  return {
    loanAmount,
    monthlyPayment,
    totalPayment,
    totalInterest,
    paymentSchedule,
    currency: "UGX",
  };
}
