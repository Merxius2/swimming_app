/**
 * Savings pots (spaarpotjes) calculation utilities
 */

import { parseNonNegativeAmount } from './amountInput';

export const SHARED_SAVINGS_POTS_KEY = 'sharedSavingsPots';
export const PERSON1_SAVINGS_POTS_KEY = 'person1SavingsPots';
export const PERSON2_SAVINGS_POTS_KEY = 'person2SavingsPots';
/** @deprecated Migrated to person1SavingsPots */
export const SEPARATE_SAVINGS_POTS_KEY = 'separateSavingsPots';

const STORAGE_KEYS = {
  shared: SHARED_SAVINGS_POTS_KEY,
  person1: PERSON1_SAVINGS_POTS_KEY,
  person2: PERSON2_SAVINGS_POTS_KEY,
};

export function getSavingsPotsStorageKey(scope) {
  return STORAGE_KEYS[scope] || SHARED_SAVINGS_POTS_KEY;
}

function loadPotsFromData(savedData, scope) {
  const key = getSavingsPotsStorageKey(scope);
  if (Array.isArray(savedData[key])) return savedData[key];

  if (scope === 'shared' && savedData.savingsPots) {
    return savedData.savingsPots;
  }
  if (scope === 'person1' && savedData.separateSavingsPots && !savedData[PERSON1_SAVINGS_POTS_KEY]) {
    return savedData.separateSavingsPots;
  }

  return [];
}

/**
 * Read savings pots for a scope (shared, person1, person2).
 */
export function getSavingsPotsForScope(dashboardData, scope) {
  if (!dashboardData) return [];
  return loadPotsFromData(dashboardData, scope);
}

/**
 * Read all savings pots relevant to the active dashboard calculation mode.
 */
export function getSavingsPotsForMode(dashboardData, calculationType = dashboardData?.calculationType) {
  if (!dashboardData) return [];

  if (calculationType === 'separate') {
    return [
      ...getSavingsPotsForScope(dashboardData, 'person1'),
      ...getSavingsPotsForScope(dashboardData, 'person2'),
    ];
  }

  return getSavingsPotsForScope(dashboardData, 'shared');
}

/**
 * Sum monthly contributions across all savings pots.
 */
export function calculateSavingsPotsMonthlyTotal(savingsPots = []) {
  return savingsPots.reduce(
    (sum, pot) => sum + parseNonNegativeAmount(pot.monthlyContribution),
    0
  );
}

/**
 * Total spaarpot contributions for separate mode (both persons).
 */
export function calculateSeparateModePotsMonthlyTotal(dashboardData) {
  return (
    calculateSavingsPotsMonthlyTotal(getSavingsPotsForScope(dashboardData, 'person1')) +
    calculateSavingsPotsMonthlyTotal(getSavingsPotsForScope(dashboardData, 'person2'))
  );
}
