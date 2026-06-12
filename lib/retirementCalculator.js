/**
 * Retirement calculation utilities
 * Provides projection calculations for retirement planning
 */

/**
 * Generate forward projection: input monthly investment, calculate final balance
 * @param {number} currentAge - Current age in years
 * @param {number} retirementAge - Target retirement age in years
 * @param {number} monthlyInvestment - Monthly investment amount
 * @param {number} annualReturn - Expected annual return percentage
 * @param {number} currentBalance - Starting balance (default: 0)
 * @returns {array} Array of projection data {age, balance, contributions, gains}
 */
export function generateForwardProjection(currentAge, retirementAge, monthlyInvestment, annualReturn, currentBalance = 0) {
  // Validate inputs
  const current = Math.max(0, parseInt(currentAge) || 0);
  const retirement = Math.max(current, parseInt(retirementAge) || 65);
  const monthly = Math.max(0, parseFloat(monthlyInvestment) || 0);
  const annualRate = parseFloat(annualReturn) ?? 7;
  const initialBalance = Math.max(0, parseFloat(currentBalance) || 0);
  
  // Guard against invalid scenarios
  if (retirement <= current || current < 0) {
    return [];
  }
  
  const rate = Math.max(-0.99, annualRate) / 100 / 12; // Cap rate to prevent extreme values
  const data = [];

  let balance = initialBalance;
  for (let age = current; age < retirement; age++) {
    for (let month = 0; month < 12; month++) {
      balance = balance * (1 + rate) + monthly;
    }
    const yearsElapsed = age - current;
    const totalContributions = initialBalance + yearsElapsed * 12 * monthly;
    const gains = Math.floor(balance - totalContributions);
    
    data.push({ 
      age, 
      balance: Math.floor(balance),
      contributions: Math.floor(totalContributions),
      gains: gains,
      currentBalance: Math.floor(initialBalance),
    });
  }
  // Add final data point at retirement age with final balance
  const yearsElapsedFinal = retirement - current;
  const totalContributionsFinal = initialBalance + yearsElapsedFinal * 12 * monthly;
  const gainsFinal = Math.floor(balance - totalContributionsFinal);
  data.push({
    age: retirement,
    balance: Math.floor(balance),
    contributions: Math.floor(totalContributionsFinal),
    gains: gainsFinal,
    currentBalance: Math.floor(initialBalance),
  });
  return data;
}

/**
 * Generate backward projection: input goal balance, calculate required monthly investment
 * @param {number} currentAge - Current age in years
 * @param {number} retirementAge - Target retirement age in years
 * @param {number} goalBalance - Target retirement balance
 * @param {number} annualReturn - Expected annual return percentage
 * @param {number} currentBalance - Starting balance (default: 0)
 * @returns {array} Array of projection data {age, balance, contributions, gains}
 */
export function generateBackwardProjection(currentAge, retirementAge, goalBalance, annualReturn, currentBalance = 0) {
  // Validate inputs
  const current = Math.max(0, parseInt(currentAge) || 0);
  const retirement = Math.max(current, parseInt(retirementAge) || 65);
  const goal = Math.max(0, parseFloat(goalBalance) || 500000);
  const annualRate = parseFloat(annualReturn) ?? 7;
  const initialBalance = Math.max(0, parseFloat(currentBalance) || 0);
  
  // Guard against invalid scenarios
  if (retirement <= current || current < 0 || goal < 0) {
    return [];
  }
  
  const rate = Math.max(-0.99, annualRate) / 100 / 12; // Cap rate to prevent extreme values
  const months = (retirement - current) * 12;
  const data = [];

  // Calculate required monthly investment using the future value formula
  // FV = PV(1+r)^n + PMT * (((1 + r)^n - 1) / r)
  // PMT = (FV - PV(1+r)^n) / (((1 + r)^n - 1) / r)
  let requiredMonthly = 0;
  if (rate === 0) {
    // When rate is 0, compound interest doesn't apply
    const remainingGoal = Math.max(0, goal - initialBalance);
    requiredMonthly = months > 0 ? remainingGoal / months : 0;
  } else {
    const factor = (Math.pow(1 + rate, months) - 1) / rate;
    const futureValueOfInitial = initialBalance * Math.pow(1 + rate, months);
    
    // If initial balance already grows to meet or exceed goal, no monthly investment needed
    if (futureValueOfInitial >= goal) {
      requiredMonthly = 0;
    } else {
      const remainingGoal = goal - futureValueOfInitial;
      requiredMonthly = factor > 0 ? remainingGoal / factor : 0;
    }
  }
  
  // Ensure requiredMonthly is not negative (account for floating point precision)
  requiredMonthly = Math.max(0, requiredMonthly);

  let balance = initialBalance;
  for (let age = current; age < retirement; age++) {
    for (let month = 0; month < 12; month++) {
      balance = balance * (1 + rate) + requiredMonthly;
    }
    const yearsElapsed = age - current;
    const totalContributions = initialBalance + yearsElapsed * 12 * requiredMonthly;
    const gains = Math.floor(balance - totalContributions);
    
    data.push({ 
      age, 
      balance: Math.floor(balance),
      contributions: Math.floor(totalContributions),
      gains: gains,
      currentBalance: Math.floor(initialBalance),
    });
  }
  // Add final data point at retirement age with final balance
  const yearsElapsedFinal = retirement - current;
  const totalContributionsFinal = initialBalance + yearsElapsedFinal * 12 * requiredMonthly;
  const gainsFinal = Math.floor(balance - totalContributionsFinal);
  data.push({
    age: retirement,
    balance: Math.floor(balance),
    contributions: Math.floor(totalContributionsFinal),
    gains: gainsFinal,
    currentBalance: Math.floor(initialBalance),
  });
  return data;
}

/**
 * Calculate required monthly investment for a goal balance (backward calculation)
 * Extracted for reuse across pages to avoid duplication
 * 
 * @param {number} goal - Target retirement balance
 * @param {number} currentAge - Current age in years
 * @param {number} retirementAge - Target retirement age in years
 * @param {number} annualReturn - Expected annual return percentage (default 7%)
 * @returns {number} Required monthly investment amount
 */
export function calculateMonthlyInvestmentBackward(goal, currentAge, retirementAge, annualReturn = 7, currentBalance = 0) {
  // Validate inputs
  const validGoal = Math.max(0, parseFloat(goal) || 0);
  const validCurrentAge = Math.max(0, parseInt(currentAge) || 0);
  const validRetirementAge = Math.max(validCurrentAge, parseInt(retirementAge) || 65);
  const validRate = Math.max(0, (parseFloat(annualReturn) ?? 7) / 100 / 12);
  const validInitialBalance = Math.max(0, parseFloat(currentBalance) || 0);
  
  const months = (validRetirementAge - validCurrentAge) * 12;
  
  // Guard against invalid scenarios
  if (months <= 0) {
    return 0;
  }
  
  if (validGoal <= 0) {
    return 0;
  }
  
  // Calculate using future value formula: FV = PV(1+r)^n + PMT * (((1 + r)^n - 1) / r)
  // Solving for PMT: PMT = (FV - PV(1+r)^n) / (((1 + r)^n - 1) / r)
  if (validRate === 0) {
    // When rate is 0, compound interest doesn't apply
    const remainingGoal = Math.max(0, validGoal - validInitialBalance);
    return months > 0 ? Math.floor(remainingGoal / months) : 0;
  }
  
  try {
    const factor = (Math.pow(1 + validRate, months) - 1) / validRate;
    const futureValueOfInitial = validInitialBalance * Math.pow(1 + validRate, months);
    
    // If initial balance already grows to meet or exceed goal, no monthly investment needed
    if (futureValueOfInitial >= validGoal) {
      return 0;
    }
    
    const remainingGoal = validGoal - futureValueOfInitial;
    return factor > 0 ? Math.floor(remainingGoal / factor) : 0;
  } catch {
    // Fallback if calculation fails
    return 0;
  }
}
