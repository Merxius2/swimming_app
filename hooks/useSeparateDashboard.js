/**
 * useSeparateDashboard Hook
 * Manages state and logic for the separate (two-person) mode dashboard
 */

import { useState, useEffect, useRef } from 'react';
import { PERSONAL_EXPENSE_CATEGORIES, SHARED_EXPENSE_CATEGORIES } from '../lib/constants';
import { loadFromCookie, saveToCookie } from '../lib/cookieStorage';
import { sanitizeNonNegativeInput, parseNonNegativeAmount } from '../lib/amountInput';
import { calculateSavingsPotsMonthlyTotal } from '../lib/savingsPots';

const SEPARATE_PIE_CATEGORIES = [...new Set([
  ...PERSONAL_EXPENSE_CATEGORIES,
  ...SHARED_EXPENSE_CATEGORIES,
])];

function mergeSeparateModeExpenses(person1Expenses, person2Expenses, sharedExpenses) {
  return SEPARATE_PIE_CATEGORIES.reduce((acc, cat) => {
    acc[cat] =
      (parseFloat(person1Expenses[cat]) || 0) +
      (parseFloat(person2Expenses[cat]) || 0) +
      (parseFloat(sharedExpenses[cat]) || 0);
    return acc;
  }, {});
}

export function useSeparateDashboard(
  isInitialized = true,
  enabled = true,
  person1SavingsPots = [],
  person2SavingsPots = []
) {
  // Person 1 state
  const [person1Incomes, setPerson1Incomes] = useState([]);
  const [person1Savings, setPerson1Savings] = useState('');
  const [person1Expenses, setPerson1Expenses] = useState(
    PERSONAL_EXPENSE_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: '' }), {})
  );
  const [person1Name, setPerson1Name] = useState('Person 1');

  // Person 2 state
  const [person2Incomes, setPerson2Incomes] = useState([]);
  const [person2Savings, setPerson2Savings] = useState('');
  const [person2Expenses, setPerson2Expenses] = useState(
    PERSONAL_EXPENSE_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: '' }), {})
  );
  const [person2Name, setPerson2Name] = useState('Person 2');

  // Shared expenses
  const [sharedExpenses, setSharedExpenses] = useState(
    SHARED_EXPENSE_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: '' }), {})
  );
  const [includeSavingsInCalculations, setIncludeSavingsInCalculations] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef(null);

  // Load data from cookies when enabled
  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const savedData = loadFromCookie('AUDIT_DASHBOARD_DATA');
    if (savedData) {
      if (savedData.person1Incomes) setPerson1Incomes(savedData.person1Incomes);
      if (savedData.person1Savings) setPerson1Savings(sanitizeNonNegativeInput(savedData.person1Savings));
      if (savedData.person1Expenses) setPerson1Expenses(savedData.person1Expenses);
      
      if (savedData.person2Incomes) setPerson2Incomes(savedData.person2Incomes);
      if (savedData.person2Savings) setPerson2Savings(sanitizeNonNegativeInput(savedData.person2Savings));
      if (savedData.person2Expenses) setPerson2Expenses(savedData.person2Expenses);

      if (savedData.sharedExpenses) setSharedExpenses(savedData.sharedExpenses);

      if (savedData.person1Name) setPerson1Name(savedData.person1Name);
      if (savedData.person2Name) setPerson2Name(savedData.person2Name);
      if (savedData.includeSavingsInCalculations !== undefined) {
        setIncludeSavingsInCalculations(savedData.includeSavingsInCalculations);
      }
    }
    setIsLoading(false);
  }, [enabled]);

  // Debounced save with calculationType preservation
  useEffect(() => {
    if (isLoading || !isInitialized || !enabled) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      const existingData = loadFromCookie('AUDIT_DASHBOARD_DATA') || {};
      saveToCookie('AUDIT_DASHBOARD_DATA', {
        ...existingData,
        person1Incomes,
        person1Savings,
        person1Expenses,
        person2Incomes,
        person2Savings,
        person2Expenses,
        sharedExpenses,
        person1Name,
        person2Name,
        includeSavingsInCalculations,
      }, 365);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [person1Incomes, person1Savings, person1Expenses, person2Incomes, person2Savings, person2Expenses, sharedExpenses, person1Name, person2Name, includeSavingsInCalculations, isLoading, isInitialized, enabled]);

  // Calculations for Person 1
  const person1Income = person1Incomes.reduce((sum, income) => sum + (parseFloat(income.amount) || 0), 0);
  const person1PersonalExpenses = Object.values(person1Expenses).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const person1SavingsNum = parseNonNegativeAmount(person1Savings);

  // Calculations for Person 2
  const person2Income = person2Incomes.reduce((sum, income) => sum + (parseFloat(income.amount) || 0), 0);
  const person2PersonalExpenses = Object.values(person2Expenses).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const person2SavingsNum = parseNonNegativeAmount(person2Savings);

  // Combined calculations
  const totalIncome = person1Income + person2Income;
  const sharedExpensesTotal = Object.values(sharedExpenses).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

  // Income ratios
  const person1Ratio = totalIncome > 0 ? person1Income / totalIncome : 0.5;
  const person2Ratio = totalIncome > 0 ? person2Income / totalIncome : 0.5;

  // Contributions to shared account
  const person1Contribution = sharedExpensesTotal * person1Ratio;
  const person2Contribution = sharedExpensesTotal * person2Ratio;

  const person1PotsMonthly = calculateSavingsPotsMonthlyTotal(person1SavingsPots);
  const person2PotsMonthly = calculateSavingsPotsMonthlyTotal(person2SavingsPots);
  const person1TotalSavings = person1SavingsNum + person1PotsMonthly;
  const person2TotalSavings = person2SavingsNum + person2PotsMonthly;
  const potsMonthlyTotal = person1PotsMonthly + person2PotsMonthly;
  const householdSavingsInCalc = includeSavingsInCalculations
    ? person1TotalSavings + person2TotalSavings
    : 0;
  const person1SavingsInCalc = includeSavingsInCalculations ? person1TotalSavings : 0;
  const person2SavingsInCalc = includeSavingsInCalculations ? person2TotalSavings : 0;

  const totalHouseholdExpenses = person1PersonalExpenses + person2PersonalExpenses + sharedExpensesTotal;
  const householdLeftover = totalIncome - householdSavingsInCalc - totalHouseholdExpenses;

  // Final balances
  const person1Balance = person1Income - person1SavingsInCalc - person1PersonalExpenses - person1Contribution;
  const person2Balance = person2Income - person2SavingsInCalc - person2PersonalExpenses - person2Contribution;
  const sharedBalance = person1Contribution + person2Contribution - sharedExpensesTotal;

  const mergedExpenses = mergeSeparateModeExpenses(person1Expenses, person2Expenses, sharedExpenses);
  const pieData = [
    ...SEPARATE_PIE_CATEGORIES.map((cat) => ({
      name: cat,
      value: mergedExpenses[cat] || 0,
    })).filter((item) => item.value > 0),
    ...(includeSavingsInCalculations && householdSavingsInCalc > 0
      ? [{ name: 'Savings', value: householdSavingsInCalc }]
      : []),
    { name: 'Remaining', value: Math.max(householdLeftover, 0) },
  ];

  return {
    // Person 1 state
    person1Incomes,
    setPerson1Incomes,
    person1Savings,
    setPerson1Savings,
    person1Expenses,
    setPerson1Expenses,
    person1Name,
    setPerson1Name,

    // Person 2 state
    person2Incomes,
    setPerson2Incomes,
    person2Savings,
    setPerson2Savings,
    person2Expenses,
    setPerson2Expenses,
    person2Name,
    setPerson2Name,

    // Shared expenses
    sharedExpenses,
    setSharedExpenses,
    includeSavingsInCalculations,
    setIncludeSavingsInCalculations,

    // Loading state
    isLoading,

    // Calculations
    person1Income,
    person1PersonalExpenses,
    person1SavingsNum,
    person1PotsMonthly,
    person1TotalSavings,
    person1SavingsInCalc,
    person1Ratio,
    person1Contribution,
    person1Balance,

    person2Income,
    person2PersonalExpenses,
    person2SavingsNum,
    person2PotsMonthly,
    person2TotalSavings,
    person2SavingsInCalc,
    person2Ratio,
    person2Contribution,
    person2Balance,

    totalIncome,
    totalHouseholdExpenses,
    householdSavingsInCalc,
    householdLeftover,
    sharedExpensesTotal,
    sharedBalance,
    potsMonthlyTotal,
    pieData,
  };
}
