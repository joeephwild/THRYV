/**
 * Financial utility functions for the application
 */

/**
 * Calculate compound interest
 * @param principal - Initial investment amount
 * @param rate - Annual interest rate (as a decimal, e.g., 0.05 for 5%)
 * @param time - Time in years
 * @param frequency - Compounding frequency per year (default: 1)
 * @returns Final amount after compound interest
 */
export const calculateCompoundInterest = (
  principal: number,
  rate: number,
  time: number,
  frequency = 1
): number => {
  return principal * Math.pow(1 + rate / frequency, frequency * time);
};

/**
 * Calculate simple interest
 * @param principal - Initial amount
 * @param rate - Annual interest rate (as a decimal)
 * @param time - Time in years
 * @returns Interest earned
 */
export const calculateSimpleInterest = (principal: number, rate: number, time: number): number => {
  return principal * rate * time;
};

/**
 * Calculate monthly payment for a loan
 * @param principal - Loan amount
 * @param rate - Annual interest rate (as a decimal)
 * @param years - Loan term in years
 * @returns Monthly payment amount
 */
export const calculateMonthlyPayment = (principal: number, rate: number, years: number): number => {
  const monthlyRate = rate / 12;
  const numberOfPayments = years * 12;
  
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  );
};

/**
 * Calculate future value of regular deposits
 * @param deposit - Regular deposit amount
 * @param rate - Annual interest rate (as a decimal)
 * @param years - Number of years
 * @param frequency - Deposit frequency per year (default: 12 for monthly)
 * @returns Future value
 */
export const calculateFutureValueOfDeposits = (
  deposit: number,
  rate: number,
  years: number,
  frequency = 12
): number => {
  const r = rate / frequency;
  const n = frequency * years;
  
  return deposit * ((Math.pow(1 + r, n) - 1) / r);
};

/**
 * Calculate required monthly savings to reach a goal
 * @param goal - Target amount
 * @param rate - Annual interest rate (as a decimal)
 * @param years - Number of years
 * @returns Required monthly deposit
 */
export const calculateRequiredMonthlySavings = (goal: number, rate: number, years: number): number => {
  const r = rate / 12;
  const n = 12 * years;
  
  return (goal * r) / (Math.pow(1 + r, n) - 1);
};

/**
 * Calculate the time required to reach a savings goal
 * @param goal - Target amount
 * @param principal - Initial amount
 * @param monthlyDeposit - Monthly deposit amount
 * @param rate - Annual interest rate (as a decimal)
 * @returns Time in years
 */
export const calculateTimeToReachGoal = (
  goal: number,
  principal: number,
  monthlyDeposit: number,
  rate: number
): number => {
  const r = rate / 12;
  
  // If no monthly deposit, use simple formula
  if (monthlyDeposit === 0) {
    return Math.log(goal / principal) / Math.log(1 + r) / 12;
  }
  
  // With monthly deposits, use iterative approach
  let balance = principal;
  let months = 0;
  
  while (balance < goal && months < 1200) { // Cap at 100 years
    balance = balance * (1 + r) + monthlyDeposit;
    months++;
  }
  
  return months / 12;
};

/**
 * Calculate the inflation-adjusted value
 * @param currentValue - Current monetary value
 * @param inflationRate - Annual inflation rate (as a decimal)
 * @param years - Number of years
 * @returns Inflation-adjusted value
 */
export const calculateInflationAdjustedValue = (
  currentValue: number,
  inflationRate: number,
  years: number
): number => {
  return currentValue / Math.pow(1 + inflationRate, years);
};

/**
 * Calculate the return on investment (ROI)
 * @param initialInvestment - Initial investment amount
 * @param finalValue - Final value of investment
 * @returns ROI as a decimal
 */
export const calculateROI = (initialInvestment: number, finalValue: number): number => {
  return (finalValue - initialInvestment) / initialInvestment;
};

/**
 * Format currency amount
 * @param amount - Amount to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Calculate the percentage of a value
 * @param value - The value
 * @param total - The total
 * @returns Percentage as a number
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

/**
 * Calculate the compound annual growth rate (CAGR)
 * @param initialValue - Initial investment value
 * @param finalValue - Final investment value
 * @param years - Number of years
 * @returns CAGR as a decimal
 */
export const calculateCAGR = (initialValue: number, finalValue: number, years: number): number => {
  return Math.pow(finalValue / initialValue, 1 / years) - 1;
};

/**
 * Calculate the weighted average
 * @param values - Array of values
 * @param weights - Array of weights
 * @returns Weighted average
 */
export const calculateWeightedAverage = (values: number[], weights: number[]): number => {
  if (values.length !== weights.length) {
    throw new Error('Values and weights arrays must have the same length');
  }
  
  const sum = values.reduce((acc, val, i) => acc + val * weights[i], 0);
  const weightSum = weights.reduce((acc, weight) => acc + weight, 0);
  
  return sum / weightSum;
};