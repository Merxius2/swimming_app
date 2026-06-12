/**
 * Expense line-item utilities for itemized expense categories
 */

import { MANAGEABLE_CATEGORIES_BY_SCOPE } from './constants';
import { parseNonNegativeAmount, sanitizeNonNegativeInput } from './amountInput';

const LEGACY_EXPENSE_KEYS = {
  shared: 'expenses',
  person1: 'person1Expenses',
  person2: 'person2Expenses',
  separateShared: 'sharedExpenses',
};

export function getManageableCategories(scope) {
  return MANAGEABLE_CATEGORIES_BY_SCOPE[scope] || [];
}

export function createEmptyLineItems(scope) {
  return getManageableCategories(scope).reduce((acc, cat) => ({ ...acc, [cat]: [] }), {});
}

export function calculateLineItemsTotal(items = []) {
  return items.reduce((sum, item) => sum + parseNonNegativeAmount(item.amount), 0);
}

export function syncExpenseCategoryFromLineItems(expenses, category, items) {
  const total = calculateLineItemsTotal(items);
  return { ...expenses, [category]: total > 0 ? String(total) : '' };
}

export function migrateLegacyLineItems(lineItems, expenses, categories) {
  const next = { ...lineItems };
  categories.forEach((cat) => {
    if (!next[cat]) next[cat] = [];
    if (!next[cat].length && expenses?.[cat]) {
      next[cat] = [{
        id: `legacy-${cat}`,
        name: '',
        amount: sanitizeNonNegativeInput(String(expenses[cat])),
      }];
    }
  });
  return next;
}

export function loadExpenseLineItemsForScope(savedData, scope) {
  const categories = getManageableCategories(scope);
  const base = createEmptyLineItems(scope);
  const stored = savedData?.expenseLineItems?.[scope] || {};
  const legacyKey = LEGACY_EXPENSE_KEYS[scope];
  const legacyExpenses = legacyKey ? savedData?.[legacyKey] : {};

  return migrateLegacyLineItems(
    { ...base, ...stored },
    legacyExpenses,
    categories
  );
}

export function isManageableCategory(scope, category) {
  return getManageableCategories(scope).includes(category);
}
