/**
 * Medal definitions and evaluation from swim sessions.
 */

const getWeekKey = (dateStr) => {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
};

const getMonthKey = (dateStr) => dateStr.slice(0, 7);

const getSeason = (dateStr) => {
  const month = parseInt(dateStr.slice(5, 7), 10);
  const year = parseInt(dateStr.slice(0, 4), 10);
  if (month >= 6 && month <= 8) return { name: 'summer', year };
  if (month >= 12) return { name: 'winter', year };
  if (month <= 2) return { name: 'winter', year: year - 1 };
  if (month >= 3 && month <= 5) return { name: 'spring', year };
  return { name: 'autumn', year };
};

const seasonLabel = (season) => `${season.name}-${season.year}`;

const clampPercent = (current, target) => {
  if (target == null || target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
};

const paceProgressPercent = (bestPace, targetSec = 120, baselineSec = 180) => {
  if (bestPace == null) return 0;
  if (bestPace <= targetSec) return 100;
  if (bestPace >= baselineSec) return 0;
  return Math.round(((baselineSec - bestPace) / (baselineSec - targetSec)) * 100);
};

const maxInMonth = (byMonth, field) =>
  Math.max(0, ...Object.values(byMonth).map((m) => m[field]));

const maxSeasonDistance = (bySeason, prefix) =>
  Math.max(
    0,
    ...Object.entries(bySeason)
      .filter(([k]) => k.startsWith(`${prefix}-`))
      .map(([, v]) => v.distanceM)
  );

const bestSeasonEntry = (bySeason, prefix) => {
  let best = null;
  Object.entries(bySeason).forEach(([key, value]) => {
    if (!key.startsWith(`${prefix}-`)) return;
    if (!best || value.distanceM > best.distanceM) {
      best = { key, distanceM: value.distanceM };
    }
  });
  return best;
};

const bestMonthEntry = (byMonth, field) => {
  let best = null;
  Object.entries(byMonth).forEach(([key, value]) => {
    const v = value[field];
    if (!best || v > best.value) {
      best = { key, value: v };
    }
  });
  return best;
};

export const getMedalProgress = (medal, ctx) => {
  const emptyMonth = { sessions: 0, distanceM: 0, activeKcal: 0 };
  const currentMonth = ctx.byMonth[ctx.currentMonthKey] || emptyMonth;
  const currentSeason = ctx.bySeason[ctx.currentSeasonKey] || emptyMonth;

  const countProgress = (current, target, scope, extra = {}) => ({
    percent: clampPercent(current, target),
    kind: 'sessions',
    scope,
    current,
    target,
    ...extra,
  });

  const distanceProgress = (current, target, scope, extra = {}) => ({
    percent: clampPercent(current, target),
    kind: 'distance',
    scope,
    current,
    target,
    ...extra,
  });

  const kcalProgress = (current, target, scope, extra = {}) => ({
    percent: clampPercent(current, target),
    kind: 'kcal',
    scope,
    current,
    target,
    ...extra,
  });

  switch (medal.id) {
    case 'first_splash':
      return countProgress(ctx.totalSessions, 1, 'lifetime');
    case 'ten_sessions':
      return countProgress(ctx.totalSessions, 10, 'lifetime');
    case 'twenty_five_sessions':
      return countProgress(ctx.totalSessions, 25, 'lifetime');
    case 'ten_k_lifetime':
      return distanceProgress(ctx.totalDistanceM, 10000, 'lifetime');
    case 'fifty_k_lifetime':
      return distanceProgress(ctx.totalDistanceM, 50000, 'lifetime');
    case 'hundred_k_lifetime':
      return distanceProgress(ctx.totalDistanceM, 100000, 'lifetime');
    case 'two_k_session':
      return distanceProgress(ctx.maxDistance ?? 0, 2000, 'best_session');
    case 'two_five_k_session':
      return distanceProgress(ctx.maxDistance ?? 0, 2500, 'best_session');
    case 'three_k_session':
      return distanceProgress(ctx.maxDistance ?? 0, 3000, 'best_session');
    case 'sub_200_pace':
      return {
        percent: paceProgressPercent(ctx.bestPace),
        kind: 'pace',
        scope: 'best_session',
        current: ctx.bestPace,
        target: 120,
      };
    case 'four_sessions_week':
      return countProgress(ctx.maxSessionsInWeek, 4, 'best_week');
    case 'five_k_week':
      return distanceProgress(ctx.maxDistanceInWeek, 5000, 'best_week');
    case 'eight_sessions_month': {
      const best = bestMonthEntry(ctx.byMonth, 'sessions');
      return countProgress(currentMonth.sessions, 8, 'current_month', {
        best: best?.value ?? 0,
        bestPeriod: best?.key,
        bestScope: 'best_month',
      });
    }
    case 'ten_k_month': {
      const best = bestMonthEntry(ctx.byMonth, 'distanceM');
      return distanceProgress(currentMonth.distanceM, 10000, 'current_month', {
        best: best?.value ?? 0,
        bestPeriod: best?.key,
        bestScope: 'best_month',
      });
    }
    case 'twenty_k_month': {
      const best = bestMonthEntry(ctx.byMonth, 'distanceM');
      return distanceProgress(currentMonth.distanceM, 20000, 'current_month', {
        best: best?.value ?? 0,
        bestPeriod: best?.key,
        bestScope: 'best_month',
      });
    }
    case 'ten_k_cal_month': {
      const best = bestMonthEntry(ctx.byMonth, 'activeKcal');
      return kcalProgress(currentMonth.activeKcal, 10000, 'current_month', {
        best: best?.value ?? 0,
        bestPeriod: best?.key,
        bestScope: 'best_month',
      });
    }
    case 'season_summer':
    case 'season_winter':
    case 'season_spring':
    case 'season_autumn': {
      const prefix = medal.season;
      const target = prefix === 'summer' ? 15000 : 10000;
      const inSeason = ctx.currentSeasonKey.startsWith(`${prefix}-`);
      const current = inSeason ? currentSeason.distanceM : maxSeasonDistance(ctx.bySeason, prefix);
      const scope = inSeason ? 'current_season' : 'best_season';
      const best = bestSeasonEntry(ctx.bySeason, prefix);
      return distanceProgress(current, target, scope, {
        best: best?.distanceM ?? 0,
        bestPeriod: best?.key,
        bestScope: 'best_season',
        seasonPrefix: prefix,
      });
    }
    default:
      return null;
  }
};

export const buildMedalContext = (sessions) => {
  const sorted = [...(sessions || [])].sort((a, b) => new Date(a.date) - new Date(b.date));

  const totalDistanceM = sorted.reduce((s, x) => s + (x.metrics?.distanceM || 0), 0);
  const totalActiveKcal = sorted.reduce((s, x) => s + (x.metrics?.activeKcal || 0), 0);

  const byWeek = {};
  const byMonth = {};
  const bySeason = {};

  sorted.forEach((session) => {
    const wk = getWeekKey(session.date);
    const mo = getMonthKey(session.date);
    const sn = seasonLabel(getSeason(session.date));

    if (!byWeek[wk]) byWeek[wk] = { sessions: 0, distanceM: 0, activeKcal: 0 };
    if (!byMonth[mo]) byMonth[mo] = { sessions: 0, distanceM: 0, activeKcal: 0 };
    if (!bySeason[sn]) bySeason[sn] = { sessions: 0, distanceM: 0, activeKcal: 0 };

    byWeek[wk].sessions += 1;
    byWeek[wk].distanceM += session.metrics?.distanceM || 0;
    byWeek[wk].activeKcal += session.metrics?.activeKcal || 0;

    byMonth[mo].sessions += 1;
    byMonth[mo].distanceM += session.metrics?.distanceM || 0;
    byMonth[mo].activeKcal += session.metrics?.activeKcal || 0;

    bySeason[sn].sessions += 1;
    bySeason[sn].distanceM += session.metrics?.distanceM || 0;
    bySeason[sn].activeKcal += session.metrics?.activeKcal || 0;
  });

  const maxInWeek = (field) => Math.max(0, ...Object.values(byWeek).map((w) => w[field]));
  const monthsMeeting = (field, threshold) =>
    Object.entries(byMonth).filter(([, v]) => v[field] >= threshold).map(([k]) => k);
  const seasonsMeeting = (field, threshold) =>
    Object.entries(bySeason).filter(([, v]) => v[field] >= threshold).map(([k]) => k);

  const bestPace = sorted.reduce((best, s) => {
    const p = s.metrics?.paceSecPer100m;
    if (p == null) return best;
    return best == null || p < best ? p : best;
  }, null);

  const maxDistance = sorted.reduce((best, s) => {
    const d = s.metrics?.distanceM;
    if (d == null) return best;
    return best == null || d > best ? d : best;
  }, null);

  const todayKey = new Date().toISOString().slice(0, 10);
  const currentMonthKey = getMonthKey(todayKey);
  const currentSeasonKey = seasonLabel(getSeason(todayKey));

  return {
    sessions: sorted,
    totalSessions: sorted.length,
    totalDistanceM,
    totalActiveKcal,
    byWeek,
    byMonth,
    bySeason,
    currentMonthKey,
    currentSeasonKey,
    maxSessionsInWeek: maxInWeek('sessions'),
    maxDistanceInWeek: maxInWeek('distanceM'),
    maxSessionsInMonth: maxInMonth(byMonth, 'sessions'),
    maxDistanceInMonth: maxInMonth(byMonth, 'distanceM'),
    maxActiveKcalInMonth: maxInMonth(byMonth, 'activeKcal'),
    monthsWith8Sessions: monthsMeeting('sessions', 8),
    monthsWith10k: monthsMeeting('distanceM', 10000),
    monthsWith20k: monthsMeeting('distanceM', 20000),
    monthsWith10kCal: monthsMeeting('activeKcal', 10000),
    seasonsWith15k: seasonsMeeting('distanceM', 15000),
    seasonsWith10k: seasonsMeeting('distanceM', 10000),
    seasonsWith8Sessions: seasonsMeeting('sessions', 8),
    bestPace,
    maxDistance,
  };
};

export const MEDALS = [
  // Milestones
  { id: 'first_splash', category: 'milestone', tier: 'bronze' },
  { id: 'ten_sessions', category: 'milestone', tier: 'silver' },
  { id: 'twenty_five_sessions', category: 'milestone', tier: 'gold' },
  { id: 'ten_k_lifetime', category: 'milestone', tier: 'bronze' },
  { id: 'fifty_k_lifetime', category: 'milestone', tier: 'silver' },
  { id: 'hundred_k_lifetime', category: 'milestone', tier: 'gold' },
  // Session records
  { id: 'two_k_session', category: 'distance', tier: 'bronze' },
  { id: 'two_five_k_session', category: 'distance', tier: 'silver' },
  { id: 'three_k_session', category: 'distance', tier: 'gold' },
  { id: 'sub_200_pace', category: 'distance', tier: 'gold' },
  // Weekly
  { id: 'four_sessions_week', category: 'weekly', tier: 'silver' },
  { id: 'five_k_week', category: 'weekly', tier: 'bronze' },
  // Monthly
  { id: 'eight_sessions_month', category: 'monthly', tier: 'silver' },
  { id: 'ten_k_month', category: 'monthly', tier: 'bronze' },
  { id: 'twenty_k_month', category: 'monthly', tier: 'silver' },
  { id: 'ten_k_cal_month', category: 'monthly', tier: 'gold' },
  // Seasonal
  { id: 'season_summer', category: 'seasonal', tier: 'gold', season: 'summer' },
  { id: 'season_winter', category: 'seasonal', tier: 'silver', season: 'winter' },
  { id: 'season_spring', category: 'seasonal', tier: 'bronze', season: 'spring' },
  { id: 'season_autumn', category: 'seasonal', tier: 'bronze', season: 'autumn' },
];

const evaluateMedal = (medal, ctx) => {
  switch (medal.id) {
    case 'first_splash':
      return { earned: ctx.totalSessions >= 1, periods: [] };
    case 'ten_sessions':
      return { earned: ctx.totalSessions >= 10, periods: [] };
    case 'twenty_five_sessions':
      return { earned: ctx.totalSessions >= 25, periods: [] };
    case 'ten_k_lifetime':
      return { earned: ctx.totalDistanceM >= 10000, periods: [] };
    case 'fifty_k_lifetime':
      return { earned: ctx.totalDistanceM >= 50000, periods: [] };
    case 'hundred_k_lifetime':
      return { earned: ctx.totalDistanceM >= 100000, periods: [] };
    case 'two_k_session':
      return { earned: ctx.maxDistance >= 2000, periods: [] };
    case 'two_five_k_session':
      return { earned: ctx.maxDistance >= 2500, periods: [] };
    case 'three_k_session':
      return { earned: ctx.maxDistance >= 3000, periods: [] };
    case 'sub_200_pace':
      return { earned: ctx.bestPace != null && ctx.bestPace <= 120, periods: [] };
    case 'four_sessions_week':
      return { earned: ctx.maxSessionsInWeek >= 4, periods: [] };
    case 'five_k_week':
      return { earned: ctx.maxDistanceInWeek >= 5000, periods: [] };
    case 'eight_sessions_month':
      return { earned: ctx.monthsWith8Sessions.length > 0, periods: ctx.monthsWith8Sessions };
    case 'ten_k_month':
      return { earned: ctx.monthsWith10k.length > 0, periods: ctx.monthsWith10k };
    case 'twenty_k_month':
      return { earned: ctx.monthsWith20k.length > 0, periods: ctx.monthsWith20k };
    case 'ten_k_cal_month':
      return { earned: ctx.monthsWith10kCal.length > 0, periods: ctx.monthsWith10kCal };
    case 'season_summer':
      return {
        earned: ctx.seasonsWith15k.some((k) => k.startsWith('summer-')),
        periods: ctx.seasonsWith15k.filter((k) => k.startsWith('summer-')),
      };
    case 'season_winter':
      return {
        earned: ctx.seasonsWith10k.some((k) => k.startsWith('winter-')),
        periods: ctx.seasonsWith10k.filter((k) => k.startsWith('winter-')),
      };
    case 'season_spring':
      return {
        earned: ctx.seasonsWith10k.some((k) => k.startsWith('spring-')),
        periods: ctx.seasonsWith10k.filter((k) => k.startsWith('spring-')),
      };
    case 'season_autumn':
      return {
        earned: ctx.seasonsWith10k.some((k) => k.startsWith('autumn-')),
        periods: ctx.seasonsWith10k.filter((k) => k.startsWith('autumn-')),
      };
    default:
      return { earned: false, periods: [] };
  }
};

export const evaluateAllMedals = (sessions) => {
  const ctx = buildMedalContext(sessions);
  return MEDALS.map((medal) => {
    const result = evaluateMedal(medal, ctx);
    return {
      ...medal,
      ...result,
      progress: result.earned ? null : getMedalProgress(medal, ctx),
    };
  });
};

export const getMedalStats = (medals) => ({
  earned: medals.filter((m) => m.earned).length,
  total: medals.length,
});

/** @internal */
export const __testing = { buildMedalContext, getWeekKey, getSeason };
