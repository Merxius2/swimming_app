/**
 * Loan Amortization Calculator
 * Computes monthly payment and full amortization schedule
 */

import { MONTHS_PER_YEAR } from './appConstants';

/**
 * Calculate loan amortization schedule and summary metrics
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (percentage)
 * @param {number} months - Loan duration in months
 * @returns {{ schedule: array, monthlyPayment: number, totalInterest: number, totalPayment: number }}
 */
export function calculateAmortization(principal, annualRate, months) {
  if (principal <= 0 || annualRate < 0 || months <= 0) {
    return { schedule: [], monthlyPayment: 0, totalInterest: 0, totalPayment: 0 };
  }

  const monthlyRate = annualRate / 100 / MONTHS_PER_YEAR;

  if (monthlyRate === 0) {
    const monthlyPayment = principal / months;
    const schedule = [];
    let balance = principal;

    for (let i = 1; i <= months; i++) {
      balance -= monthlyPayment;
      schedule.push({
        month: i,
        payment: monthlyPayment,
        principal: monthlyPayment,
        interest: 0,
        balance: Math.max(balance, 0),
        cumulativeInterest: 0,
      });
    }

    return { schedule, monthlyPayment, totalInterest: 0, totalPayment: principal };
  }

  const monthlyPayment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
    (Math.pow(1 + monthlyRate, months) - 1);

  const schedule = [];
  let balance = principal;
  let totalInterest = 0;

  for (let i = 1; i <= months; i++) {
    const interest = balance * monthlyRate;
    const principalPayment = monthlyPayment - interest;
    balance -= principalPayment;
    totalInterest += interest;

    schedule.push({
      month: i,
      payment: monthlyPayment,
      principal: principalPayment,
      interest,
      balance: Math.max(balance, 0),
      cumulativeInterest: totalInterest,
    });
  }

  return {
    schedule,
    monthlyPayment,
    totalInterest,
    totalPayment: principal + totalInterest,
  };
}
