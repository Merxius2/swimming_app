/**
 * Recreational 100m freestyle pace benchmarks (seconds per 100m) by age decade and sex.
 *
 * Calibrated for casual fitness swimmers in 25m pools (Apple Fitness style),
 * not competitive long-course (LCM) times.
 *
 * Sources (recreational / fitness bands):
 * - Just Swim: beginner ~2:15–3:00, intermediate ~1:45/100m
 * - Lap Swim Chart: fitness 1:30–2:00, beginner 2:00+
 * - Men's Health / Polar: average recreational ~2:00/100m, strong ~1:30/100m
 *
 * Tier meaning (lower seconds = faster):
 * - advanced: top ~15% of recreational swimmers
 * - intermediate / median: typical consistent lap swimmer
 * - beginner: building endurance, still regular
 * - slower than beginner → level "developing" (see getSwimLevel)
 */

const BENCHMARKS = {
  male: {
    '18-24': { beginner: 148, intermediate: 125, advanced: 98, median: 125 },
    '25-29': { beginner: 152, intermediate: 128, advanced: 100, median: 128 },
    '30-34': { beginner: 156, intermediate: 130, advanced: 102, median: 130 },
    '35-39': { beginner: 160, intermediate: 134, advanced: 106, median: 134 },
    '40-44': { beginner: 166, intermediate: 138, advanced: 110, median: 138 },
    '45-49': { beginner: 172, intermediate: 143, advanced: 114, median: 143 },
    '50-54': { beginner: 178, intermediate: 148, advanced: 118, median: 148 },
    '55-59': { beginner: 184, intermediate: 153, advanced: 122, median: 153 },
    '60-64': { beginner: 192, intermediate: 160, advanced: 128, median: 160 },
    '65-69': { beginner: 202, intermediate: 168, advanced: 134, median: 168 },
    '70+': { beginner: 212, intermediate: 176, advanced: 140, median: 176 },
  },
  female: {
    '18-24': { beginner: 162, intermediate: 138, advanced: 112, median: 138 },
    '25-29': { beginner: 166, intermediate: 142, advanced: 114, median: 142 },
    '30-34': { beginner: 170, intermediate: 145, advanced: 117, median: 145 },
    '35-39': { beginner: 174, intermediate: 149, advanced: 120, median: 149 },
    '40-44': { beginner: 180, intermediate: 154, advanced: 124, median: 154 },
    '45-49': { beginner: 186, intermediate: 159, advanced: 128, median: 159 },
    '50-54': { beginner: 192, intermediate: 164, advanced: 132, median: 164 },
    '55-59': { beginner: 198, intermediate: 169, advanced: 136, median: 169 },
    '60-64': { beginner: 208, intermediate: 176, advanced: 142, median: 176 },
    '65-69': { beginner: 218, intermediate: 184, advanced: 148, median: 184 },
    '70+': { beginner: 228, intermediate: 192, advanced: 154, median: 192 },
  },
};

export const BENCHMARK_METHODOLOGY = {
  audience: 'recreational_25m_pool',
  sources: ['Just Swim', 'Lap Swim Chart', 'Polar recreational ranges'],
  note: 'Not comparable to competitive USA Swimming or FINA masters LCM standards.',
};

export const getAgeGroup = (age) => {
  const a = parseInt(age, 10);
  if (!Number.isFinite(a)) return '30-34';
  if (a < 25) return '18-24';
  if (a < 30) return '25-29';
  if (a < 35) return '30-34';
  if (a < 40) return '35-39';
  if (a < 45) return '40-44';
  if (a < 50) return '45-49';
  if (a < 55) return '50-54';
  if (a < 60) return '55-59';
  if (a < 65) return '60-64';
  if (a < 70) return '65-69';
  return '70+';
};

export const getBenchmarkForProfile = (sex, age) => {
  const group = getAgeGroup(age);
  const sexKey = sex === 'female' ? 'female' : 'male';
  return BENCHMARKS[sexKey][group] || BENCHMARKS.male['30-34'];
};

export const getSwimLevel = (paceSecPer100m, benchmark) => {
  if (paceSecPer100m == null || !benchmark) return 'unknown';
  if (paceSecPer100m <= benchmark.advanced) return 'advanced';
  if (paceSecPer100m <= benchmark.intermediate) return 'intermediate';
  if (paceSecPer100m <= benchmark.beginner) return 'beginner';
  return 'developing';
};

export const computePacePercentile = (paceSecPer100m, benchmark) => {
  if (paceSecPer100m == null || !benchmark) return 50;
  const { beginner, intermediate, advanced } = benchmark;
  if (paceSecPer100m <= advanced) return Math.min(99, 85 + Math.round((advanced - paceSecPer100m) / 2));
  if (paceSecPer100m <= intermediate) {
    const range = intermediate - advanced;
    const pos = intermediate - paceSecPer100m;
    return 60 + Math.round((pos / range) * 25);
  }
  if (paceSecPer100m <= beginner) {
    const range = beginner - intermediate;
    const pos = beginner - paceSecPer100m;
    return 35 + Math.round((pos / range) * 25);
  }
  const slower = paceSecPer100m - beginner;
  return Math.max(5, 35 - Math.round(slower / 3));
};

export const getBenchmarkChartData = (paceSecPer100m, sex, age) => {
  const benchmark = getBenchmarkForProfile(sex, age);
  return [
    { category: 'advanced', value: benchmark.advanced, label: 'Advanced' },
    { category: 'intermediate', value: benchmark.intermediate, label: 'Intermediate' },
    { category: 'median', value: benchmark.median, label: 'Median' },
    { category: 'beginner', value: benchmark.beginner, label: 'Beginner' },
    { category: 'you', value: paceSecPer100m, label: 'You' },
  ].filter((d) => d.value != null);
};

export const paceVsMedian = (paceSecPer100m, benchmark) => {
  if (paceSecPer100m == null || !benchmark) return 'below';
  return paceSecPer100m <= benchmark.median ? 'above' : 'below';
};

/** @internal */
export const __testing = { BENCHMARKS };
