/**
 * useSharedDashboard Hook
 * Manages state and logic for the shared (household) mode dashboard
 */

import { useState, useEffect, useRef } from 'react';
import { EXPENSE_CATEGORIES } from '../lib/constants';
import { loadFromCookie, saveToCookie } from '../lib/cookieStorage';
import { sanitizeNonNegativeInput, parseNonNegativeAmount } from '../lib/amountInput';
import { calculateSavingsPotsMonthlyTotal } from '../lib/savingsPots';

export function useSharedDashboard(isInitialized = true, enabled = true, savingsPots = []) {
  // Shared mode state
  const [incomes, setIncomes] = useState([]);
  const [savings, setSavings] = useState('');
  const [includeSavingsInCalculations, setIncludeSavingsInCalculations] = useState(true);
  const [expenses, setExpenses] = useState(
    EXPENSE_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: '' }), {})
  );
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
      if (savedData.incomes) setIncomes(savedData.incomes);
      if (savedData.savings) setSavings(sanitizeNonNegativeInput(savedData.savings));
      if (savedData.includeSavingsInCalculations !== undefined) {
        setIncludeSavingsInCalculations(savedData.includeSavingsInCalculations);
      }
      if (savedData.expenses) setExpenses(savedData.expenses);
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
        incomes,
        savings,
        includeSavingsInCalculations,
        expenses,
      }, 365);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [incomes, savings, includeSavingsInCalculations, expenses, isLoading, isInitialized, enabled]);

  // Income management functions
  const addIncome = () => {
    const newId = Date.now().toString();
    setIncomes([...incomes, { id: newId, label: `Income ${incomes.length + 1}`, amount: '' }]);
  };

  const updateIncome = (id, field, value) => {
    setIncomes(incomes.map(income =>
      income.id === id ? { ...income, [field]: value } : income
    ));
  };

  const removeIncome = (id) => {
    setIncomes(incomes.filter(income => income.id !== id));
  };

  // Calculations
  const totalIncome = incomes.reduce((sum, income) => sum + (parseFloat(income.amount) || 0), 0);
  const savingsNum = parseNonNegativeAmount(savings);
  const potsMonthlyTotal = calculateSavingsPotsMonthlyTotal(savingsPots);
  const totalSavingsInCalc = savingsNum + potsMonthlyTotal;
  const totalExpenses = Object.values(expenses).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const leftover = totalIncome - (includeSavingsInCalculations ? totalSavingsInCalc : 0) - totalExpenses;

  // Pie chart data
  const pieData = [
    ...EXPENSE_CATEGORIES.map((cat) => ({
      name: cat,
      value: parseFloat(expenses[cat]) || 0
    })).filter(item => item.value > 0),
    ...(includeSavingsInCalculations && totalSavingsInCalc > 0 ? [{ name: 'Savings', value: totalSavingsInCalc }] : []),
    { name: 'Remaining', value: Math.max(leftover, 0) }
  ];

  return {
    // State
    incomes,
    savings,
    includeSavingsInCalculations,
    expenses,
    isLoading,
    
    // Setters
    setIncomes,
    setSavings,
    setIncludeSavingsInCalculations,
    setExpenses,
    
    // Functions
    addIncome,
    updateIncome,
    removeIncome,
    
    // Calculations
    totalIncome,
    savingsNum,
    potsMonthlyTotal,
    totalSavingsInCalc,
    totalExpenses,
    leftover,
    pieData,
  };
}
