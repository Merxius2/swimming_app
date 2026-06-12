/**
 * Benchmark comparison utilities
 */

import { BENCHMARK_MEDIANS } from './constants';

const PERCENTILE_THRESHOLDS = {
  high: 1.5,
  low: 0.5,
};

/**
 * Estimate percentile bucket from value vs median
 */
export function computePercentile(value, median) {
  if (value > median * PERCENTILE_THRESHOLDS.high) return 90;
  if (value > median) return 60;
  if (value > median * PERCENTILE_THRESHOLDS.low) return 30;
  return 10;
}

/**
 * Get benchmark data for age group and education level
 */
export function getBenchmarkForDemographic(ageGroup, education) {
  if (!ageGroup || !education) return null;
  const benchmarks = BENCHMARK_MEDIANS.byAgeAndEducation[ageGroup];
  return benchmarks ? benchmarks[education] : null;
}

/**
 * Sum asset amounts or debts from asset list
 */
export function sumAssetField(assetList, field) {
  return assetList.reduce((sum, asset) => sum + (parseFloat(asset[field]) || 0), 0);
}

export const DEFAULT_BENCHMARK_ASSETS = [
  { id: 1, name: 'House', amount: '', debt: '' },
  { id: 2, name: 'Car', amount: '', debt: '' },
  { id: 3, name: 'Phone', amount: '', debt: '' },
  { id: 4, name: 'Household Furniture', amount: '', debt: '' },
  { id: 5, name: 'Savings/Investments', amount: '', debt: '' },
];
