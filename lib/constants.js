/**
 * Shared constants across pages
 */

import { Home, Car, UtensilsCrossed, Zap, Heart, Smile, CreditCard, Phone, Shield, MoreHorizontal, Receipt, Tv } from 'lucide-react';

export const EXPENSE_CATEGORIES = [
  'House',
  'Car',
  'Food',
  'Utilities',
  'Healthcare',
  'Leisure',
  'Subscriptions',
  'Phone',
  'Insurance',
  'Other',
];

export const SHARED_EXPENSE_CATEGORIES = [
  'House',
  'Food',
  'Utilities',
  'Insurance',
  'Other',
  'Subscriptions',
  'Taxes',
  'InternetTV',
  'Car',
];

export const PERSONAL_EXPENSE_CATEGORIES = [
  'Car',
  'Healthcare',
  'Leisure',
  'Other',
  'Phone',
  'Subscriptions',
];

/** All expense categories support itemized line-item management per scope */
export const MANAGEABLE_CATEGORIES_BY_SCOPE = {
  shared: EXPENSE_CATEGORIES,
  person1: PERSONAL_EXPENSE_CATEGORIES,
  person2: PERSONAL_EXPENSE_CATEGORIES,
  separateShared: SHARED_EXPENSE_CATEGORIES,
};

export const CHART_COLORS = [
  '#EC4899', // pink
  '#10B981', // green
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#F59E0B', // amber
  '#06B6D4', // cyan
  '#14B8A6', // teal
  '#EF4444', // red
  '#8B5CF6', // violet
  '#F97316', // orange
];

export const CATEGORY_ICONS = {
  'House': Home,
  'Car': Car,
  'Food': UtensilsCrossed,
  'Utilities': Zap,
  'Healthcare': Heart,
  'Leisure': Smile,
  'Subscriptions': CreditCard,
  'Phone': Phone,
  'Insurance': Shield,
  'Other': MoreHorizontal,
  'Taxes': Receipt,
  'InternetTV': Tv,
};

export const BENCHMARK_MEDIANS = {
  // Age groups (years) with education-based breakdowns
  byAgeAndEducation: {
    '20-30': {
      highSchool: { income: 25000, netWorth: 15000 },
      bachelor: { income: 35000, netWorth: 35000 },
      master: { income: 42000, netWorth: 55000 },
    },
    '30-40': {
      highSchool: { income: 26500, netWorth: 4500 },
      bachelor: { income: 38000, netWorth: 25000 },
      master: { income: 43500, netWorth: 45000 },
    },
    '40-50': {
      highSchool: { income: 29000, netWorth: 28000 },
      bachelor: { income: 44500, netWorth: 120000 },
      master: { income: 52000, netWorth: 165000 },
    },
    '50-60': {
      highSchool: { income: 30000, netWorth: 55000 },
      bachelor: { income: 46500, netWorth: 240000 },
      master: { income: 56000, netWorth: 310000 },
    },
    '60+': {
      highSchool: { income: 28500, netWorth: 75000 },
      bachelor: { income: 42000, netWorth: 310000 },
      master: { income: 51000, netWorth: 420000 },
    },
  },
  // Fallback for backward compatibility
  nl: {
    income: 35000,
    netWorth: 100000,
  },
  international: {
    income: 45000,
    netWorth: 120000,
  },
};
