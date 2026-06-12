import {
  parseDistanceM,
  parseDurationSec,
  parsePaceSecPer100m,
} from './swimFormatters.js';

const DUTCH_DAYS = {
  ma: 1, di: 2, wo: 3, do: 4, vr: 5, za: 6, zo: 0,
};

const DUTCH_MONTHS = {
  jan: 0, feb: 1, mrt: 2, mar: 2, apr: 3, mei: 4, may: 4,
  jun: 5, jul: 6, aug: 7, sep: 8, okt: 9, oct: 9, nov: 10, dec: 11,
};

const normalizeText = (text) => String(text || '')
  .replace(/\u2013|\u2014/g, '-')
  .replace(/[''′`]/g, "'")
  .replace(/"/g, '"')
  .replace(/\s+/g, ' ')
  .trim();

const firstMatch = (text, patterns) => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match;
  }
  return null;
};

export const parseDutchDate = (text, referenceDate = new Date()) => {
  const match = text.match(
    /\b(ma|di|wo|do|vr|za|zo)\s+(\d{1,2})\s+(jan|feb|mrt|mar|apr|mei|may|jun|jul|aug|sep|okt|oct|nov|dec)\b/i
  );
  if (!match) return null;

  const day = parseInt(match[2], 10);
  const monthKey = match[3].toLowerCase().slice(0, 3);
  const month = DUTCH_MONTHS[monthKey];
  if (month == null || day < 1 || day > 31) return null;

  let year = referenceDate.getFullYear();
  const candidate = new Date(year, month, day);
  if (candidate > referenceDate) {
    year -= 1;
  }
  const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return iso;
};

const parseStrokeDistance = (text, labelPattern) => {
  const match = text.match(new RegExp(`${labelPattern}\\s*\\(([\\d.\\s]+)\\s*m\\)`, 'i'));
  if (!match) return null;
  return parseDistanceM(match[1]);
};

const parseOcrPace = (raw) => {
  if (!raw) return null;
  const direct = parsePaceSecPer100m(raw);
  if (direct) return direct;
  const compact = String(raw).match(/^(\d{2,3})"/);
  if (compact) {
    const digits = compact[1];
    if (digits.length === 3) {
      return parseInt(digits[0], 10) * 60 + parseInt(digits.slice(1), 10);
    }
  }
  return null;
};

const parseDistanceToken = (token) => {
  if (!token) return null;
  return parseDistanceM(token.replace(/\s/g, ''));
};

/** Apple Fitness activity labels and metrics that indicate a non-swim workout. */
const OTHER_SPORT_PATTERNS = [
  { sport: 'run', patterns: [/\bHardlopen\b/i, /\bIndoor\s*Run\b/i, /\bJoggen\b/i, /\bLoopband\b/i] },
  { sport: 'walk', patterns: [/\bWandelen\b/i, /\bOutdoor\s*Walk\b/i, /\bWandeltocht\b/i] },
  { sport: 'cycle', patterns: [/\bFietsen\b/i, /\bIndoor\s*Cycling\b/i, /\bOutdoor\s*Cycling\b/i] },
  { sport: 'row', patterns: [/\bRoeien\b/i, /\bIndoor\s*Rowing\b/i] },
  { sport: 'hike', patterns: [/\bHiking\b/i, /\bBergwandelen\b/i] },
  { sport: 'yoga', patterns: [/\bYoga\b/i, /\bPilates\b/i] },
  { sport: 'strength', patterns: [/\bKrachttraining\b/i, /\bFunctional\s*Strength\b/i, /\bTraditionele\s*krachttraining\b/i] },
  { sport: 'elliptical', patterns: [/\bCrosstrainer\b/i, /\bElliptical\b/i] },
  { sport: 'stair', patterns: [/\bTraplopen\b/i, /\bStair\s*Stepper\b/i] },
  { sport: 'dance', patterns: [/\bDans\b/i, /\bDance\b/i] },
];

const NON_SWIM_METRIC_PATTERNS = [
  /\bStappen\b/i,
  /\bHoogtemeters\b/i,
  /\bElevation\b/i,
  /\bAfstand\s*[\d.,]+\s*KM\b/i,
  /\/\s*KM\b/i,
  /\bmin\s*\/\s*km\b/i,
  /\bRPM\b/i,
  /\bWATT\b/i,
  /\bCadans\b/i,
  /\bBPM\b/i,
];

export const detectSwimWorkout = (text, fields = {}) => {
  const normalized = normalizeText(String(text || '').replace(/\n/g, ' '));

  for (const { sport, patterns } of OTHER_SPORT_PATTERNS) {
    if (patterns.some((p) => p.test(normalized))) {
      return { isSwimWorkout: false, detectedSport: sport };
    }
  }

  const swimSignals = [
    /\bZwem(bad|men)\b/i.test(normalized),
    /\bOpen\s*water\s*zwemmen\b/i.test(normalized),
    /\bBanen\b/i.test(normalized),
    /\bBaanlengte\b/i.test(normalized),
    /\/\s*100\s*m\b/i.test(normalized),
    fields.paceSecPer100m != null,
    /\b(Schoolslag|Vrije\s*slag|Rugslag|Vlinderslag)\b/i.test(normalized),
    fields.laps != null,
    /Doel:\s*[\d.]+\s*M\b/i.test(normalized),
    Object.values(fields.strokes || {}).some((v) => v != null),
  ].filter(Boolean).length;

  const hasNonSwimMetrics = NON_SWIM_METRIC_PATTERNS.some((p) => p.test(normalized));
  if (hasNonSwimMetrics && swimSignals < 2) {
    return { isSwimWorkout: false, detectedSport: 'other' };
  }

  if (swimSignals >= 2) {
    return { isSwimWorkout: true, detectedSport: null };
  }

  return { isSwimWorkout: false, detectedSport: 'unknown' };
};

export const parseScreenshotText = (ocrText, referenceDate = new Date()) => {
  const raw = String(ocrText || '');
  const text = normalizeText(raw.replace(/\n/g, ' '));
  const warnings = [];
  let confidence = 0;
  let fieldsFound = 0;

  const date = parseDutchDate(text, referenceDate);
  const missingDate = !date;
  if (date) fieldsFound += 1;

  const durationMatch = firstMatch(text, [
    /Work[- ]?outtijd\s*Afstand\s*(\d+:\d{2}:\d{2})/i,
    /Work[- ]?outtijd\s*(\d+:\d{2}:\d{2})/i,
    /\b(\d+:\d{2}:\d{2})\b/,
  ]);
  const durationSec = durationMatch ? parseDurationSec(durationMatch[1]) : null;
  if (durationSec) fieldsFound += 1;

  const distanceMatch = firstMatch(text, [
    /\d+:\d{2}:\d{2}\s+([\d.]+\s*M)/i,
    /Afstand\s*([\d.]+\s*M)/i,
    /Distance\s*([\d.]+\s*M)/i,
  ]);
  const distanceM = distanceMatch ? parseDistanceToken(distanceMatch[1]) : null;
  if (distanceM) fieldsFound += 1;

  let activeKcal = null;
  let totalKcal = null;
  const dualKcalMatch = text.match(
    /Actieve\s*kilocalorie[ëe]n\s*Totale\s*kilocalorie[ëe]n\s*(\d+)\s*KCAL\s*(\d+)\s*KCAL/i
  );
  if (dualKcalMatch) {
    activeKcal = parseInt(dualKcalMatch[1], 10);
    totalKcal = parseInt(dualKcalMatch[2], 10);
  } else {
    const activeKcalMatch = firstMatch(text, [
      /Actieve\s*kilocalorie[ëe]n\s*(\d+)/i,
      /Active\s*calories\s*(\d+)/i,
    ]);
    activeKcal = activeKcalMatch ? parseInt(activeKcalMatch[1], 10) : null;
    const totalKcalMatch = firstMatch(text, [
      /Totale\s*kilocalorie[ëe]n\s*(\d+)/i,
      /Total\s*calories\s*(\d+)/i,
    ]);
    totalKcal = totalKcalMatch ? parseInt(totalKcalMatch[1], 10) : null;
  }
  if (activeKcal) fieldsFound += 1;
  if (totalKcal) fieldsFound += 1;

  const paceMatch = firstMatch(text, [
    /Gem\.?\s*tempo\s*Gem\.?\s*hartslag\s*(\d+'\d{1,2}")/i,
    /Gem\.?\s*tempo\s*(\d+'\d{1,2}")/i,
    /Gem\.?\s*tempo\s*Gem\.?\s*hartslag\s*(\d{2,3}")/i,
    /(\d+'\d{1,2}")(?:\s*\/\s*100\s*m|\s*\d*\s*m)/i,
    /(\d{2,3}")(?:\s*[n\/]?\d*\s*m|\s*SPM)/i,
  ]);
  const paceSecPer100m = paceMatch ? parseOcrPace(paceMatch[1]) : null;
  if (paceSecPer100m) fieldsFound += 1;

  const hrMatch = firstMatch(text, [
    /(\d{2,3})\s*SPM/i,
    /Gem\.?\s*hartslag\s*(\d{2,3})/i,
  ]);
  const avgHeartRate = hrMatch ? parseInt(hrMatch[1], 10) : null;
  if (avgHeartRate) fieldsFound += 1;

  let laps = null;
  let poolLengthM = 25;
  const lapsPoolMatch = text.match(/Banen\s*Baanlengte\s*(\d+)\s*(\d+)\s*M/i);
  if (lapsPoolMatch) {
    laps = parseInt(lapsPoolMatch[1], 10);
    poolLengthM = parseInt(lapsPoolMatch[2], 10);
  } else {
    const lapsMatch = firstMatch(text, [/Banen\s*(\d+)/i, /Laps\s*(\d+)/i]);
    laps = lapsMatch ? parseInt(lapsMatch[1], 10) : null;
    const poolMatch = firstMatch(text, [
      /Baanlengte\s*(\d+)\s*M/i,
      /\b(\d{2})\s*M\s*$/i,
    ]);
    if (poolMatch) poolLengthM = parseInt(poolMatch[1], 10);
  }
  if (laps) fieldsFound += 1;
  if (poolLengthM !== 25 || lapsPoolMatch) fieldsFound += 1;

  const goalMatch = text.match(/Doel:\s*([\d.]+)\s*M/i);
  const goalM = goalMatch ? parseDistanceM(goalMatch[1]) : null;
  if (goalM) fieldsFound += 1;

  const timeRangeMatch = text.match(/\b(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\b/);
  const timeRange = timeRangeMatch ? `${timeRangeMatch[1]}–${timeRangeMatch[2]}` : '';

  const locationMatch = text.match(/(?:📍|pin|locatie)?\s*([A-Z][a-zà-ü]+(?:\s+[A-Z][a-zà-ü]+)?)\s*(?:\n|$|\d{1,2}:\d{2})/);
  let location = '';
  if (text.includes('Tilburg')) location = 'Tilburg';
  else if (locationMatch && !['Zwembad', 'Gemengd', 'Schoolslag'].includes(locationMatch[1])) {
    location = locationMatch[1];
  }

  const strokes = {
    mixedM: parseStrokeDistance(text, 'Gemengd'),
    breaststrokeM: parseStrokeDistance(text, 'Schoolslag'),
    freestyleM: parseStrokeDistance(text, 'Vrije\\s*slag'),
    backstrokeM: parseStrokeDistance(text, 'Rugslag'),
    butterflyM: parseStrokeDistance(text, 'Vlinderslag'),
  };

  if (Object.values(strokes).some((v) => v != null)) fieldsFound += 1;

  confidence = Math.min(100, Math.round((fieldsFound / 10) * 100));

  if (!distanceM) warnings.push('distance_not_found');
  if (!paceSecPer100m) warnings.push('pace_not_found');
  if (missingDate) warnings.push('date_missing');

  const fields = {
    date,
    durationSec,
    distanceM,
    activeKcal,
    totalKcal,
    paceSecPer100m,
    avgHeartRate,
    laps,
    poolLengthM,
    goalM,
    location,
    timeRange,
    strokes,
  };

  const { isSwimWorkout, detectedSport } = detectSwimWorkout(text, fields);
  if (!isSwimWorkout) warnings.push('not_swim_workout');

  return {
    fields,
    confidence,
    missingDate,
    warnings,
    isSwimWorkout,
    detectedSport,
  };
};

export const fieldsToSessionMetrics = (fields) => ({
  durationSec: fields.durationSec,
  distanceM: fields.distanceM,
  activeKcal: fields.activeKcal,
  totalKcal: fields.totalKcal,
  paceSecPer100m: fields.paceSecPer100m,
  avgHeartRate: fields.avgHeartRate,
  laps: fields.laps,
  poolLengthM: fields.poolLengthM || 25,
  goalM: fields.goalM,
  location: fields.location || '',
  timeRange: fields.timeRange || '',
  strokes: {
    mixedM: fields.strokes?.mixedM ?? null,
    breaststrokeM: fields.strokes?.breaststrokeM ?? null,
    freestyleM: fields.strokes?.freestyleM ?? null,
    backstrokeM: fields.strokes?.backstrokeM ?? null,
    butterflyM: fields.strokes?.butterflyM ?? null,
  },
});

/** @internal */
export const __testing = { parseDutchDate, normalizeText, detectSwimWorkout };
