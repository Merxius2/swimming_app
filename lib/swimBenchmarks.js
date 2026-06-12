/** Recreational 100m freestyle pace benchmarks (seconds per 100m) by age decade and sex */

const BENCHMARKS = {
  male: {
    '18-24': { beginner: 150, intermediate: 127, advanced: 100, median: 127 },
    '25-29': { beginner: 155, intermediate: 129, advanced: 102, median: 129 },
    '30-34': { beginner: 158, intermediate: 132, advanced: 105, median: 132 },
    '35-39': { beginner: 160, intermediate: 134, advanced: 108, median: 134 },
    '40-44': { beginner: 165, intermediate: 138, advanced: 112, median: 138 },
    '45-49': { beginner: 170, intermediate: 143, advanced: 116, median: 143 },
    '50-54': { beginner: 175, intermediate: 148, advanced: 120, median: 148 },
    '55-59': { beginner: 180, intermediate: 153, advanced: 125, median: 153 },
    '60-64': { beginner: 190, intermediate: 160, advanced: 130, median: 160 },
    '65-69': { beginner: 200, intermediate: 168, advanced: 138, median: 168 },
    '70+': { beginner: 210, intermediate: 175, advanced: 145, median: 175 },
  },
  female: {
    '18-24': { beginner: 165, intermediate: 137, advanced: 110, median: 137 },
    '25-29': { beginner: 168, intermediate: 140, advanced: 112, median: 140 },
    '30-34': { beginner: 172, intermediate: 144, advanced: 115, median: 144 },
    '35-39': { beginner: 175, intermediate: 147, advanced: 118, median: 147 },
    '40-44': { beginner: 180, intermediate: 152, advanced: 122, median: 152 },
    '45-49': { beginner: 185, intermediate: 157, advanced: 126, median: 157 },
    '50-54': { beginner: 190, intermediate: 162, advanced: 130, median: 162 },
    '55-59': { beginner: 195, intermediate: 167, advanced: 135, median: 167 },
    '60-64': { beginner: 205, intermediate: 175, advanced: 142, median: 175 },
    '65-69': { beginner: 215, intermediate: 183, advanced: 150, median: 183 },
    '70+': { beginner: 225, intermediate: 190, advanced: 158, median: 190 },
  },
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
  return 'beginner';
};

export const computePacePercentile = (paceSecPer100m, benchmark) => {
  if (paceSecPer100m == null || !benchmark) return 50;
  const { beginner, intermediate, advanced, median } = benchmark;
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
