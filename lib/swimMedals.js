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

const parseTimeRangeStartMin = (timeRange) => {
  if (!timeRange) return null;
  const match = String(timeRange).match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
};

const getMaxConsecutiveDays = (dates) => {
  if (!dates.length) return 0;
  const sorted = [...dates].sort();
  let max = 1;
  let streak = 1;
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = Math.round((curr - prev) / 86400000);
    streak = diffDays === 1 ? streak + 1 : 1;
    max = Math.max(max, streak);
  }
  return max;
};

const isHolidaySplashDate = (dateStr) => {
  const month = parseInt(dateStr.slice(5, 7), 10);
  const day = parseInt(dateStr.slice(8, 10), 10);
  return (month === 12 && day >= 20) || (month === 1 && day <= 5);
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
    case 'fifty_sessions':
      return countProgress(ctx.totalSessions, 50, 'lifetime');
    case 'two_hundred_k':
      return distanceProgress(ctx.totalDistanceM, 200000, 'lifetime');
    case 'lap_legend':
      return countProgress(ctx.totalLaps, 1000, 'lifetime');
    case 'calorie_collector':
      return kcalProgress(ctx.totalActiveKcal, 25000, 'lifetime');
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
    case 'sub_210_pace':
      return {
        percent: paceProgressPercent(ctx.bestPace, 130, 190),
        kind: 'pace',
        scope: 'best_session',
        current: ctx.bestPace,
        target: 130,
      };
    case 'marathon_session':
      return {
        percent: clampPercent(ctx.maxDurationSec ?? 0, 5400),
        kind: 'duration',
        scope: 'best_session',
        current: ctx.maxDurationSec ?? 0,
        target: 5400,
      };
    case 'century_laps':
      return countProgress(ctx.maxLapsSession ?? 0, 100, 'best_session');
    case 'furnace':
      return kcalProgress(ctx.maxActiveKcalSession ?? 0, 800, 'best_session');
    case 'pulse_racer':
      return countProgress(ctx.maxHeartRate ?? 0, 155, 'best_session');
    case 'frog_master':
      return distanceProgress(ctx.maxBreaststrokeM ?? 0, 1000, 'best_session');
    case 'four_sessions_week':
      return countProgress(ctx.maxSessionsInWeek, 4, 'best_week');
    case 'five_k_week':
      return distanceProgress(ctx.maxDistanceInWeek, 5000, 'best_week');
    case 'hat_trick':
      return countProgress(ctx.maxConsecutiveDays, 3, 'lifetime');
    case 'week_warrior':
      return countProgress(ctx.maxConsecutiveDays, 7, 'lifetime');
    case 'fortnight_flow':
      return countProgress(ctx.maxConsecutiveDays, 14, 'lifetime');
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

  const maxDurationSec = sorted.reduce((best, s) => {
    const d = s.metrics?.durationSec;
    if (d == null) return best;
    return best == null || d > best ? d : best;
  }, null);

  const maxLapsSession = sorted.reduce((best, s) => {
    const l = s.metrics?.laps;
    if (l == null) return best;
    return best == null || l > best ? l : best;
  }, null);

  const maxActiveKcalSession = sorted.reduce((best, s) => {
    const k = s.metrics?.activeKcal;
    if (k == null) return best;
    return best == null || k > best ? k : best;
  }, null);

  const maxHeartRate = sorted.reduce((best, s) => {
    const h = s.metrics?.avgHeartRate;
    if (h == null) return best;
    return best == null || h > best ? h : best;
  }, null);

  const maxBreaststrokeM = sorted.reduce((best, s) => {
    const b = s.metrics?.strokes?.breaststrokeM;
    if (b == null) return best;
    return best == null || b > best ? b : best;
  }, null);

  const totalLaps = sorted.reduce((sum, s) => sum + (s.metrics?.laps || 0), 0);

  const uniqueDates = [...new Set(sorted.map((s) => s.date))];
  const maxConsecutiveDays = getMaxConsecutiveDays(uniqueDates);

  const sessionsByDate = {};
  sorted.forEach((s) => {
    sessionsByDate[s.date] = (sessionsByDate[s.date] || 0) + 1;
  });
  const maxSessionsInDay = Math.max(0, ...Object.values(sessionsByDate));

  const hasGoalCrusher = sorted.some((s) => {
    const m = s.metrics || {};
    return m.goalM != null && m.distanceM != null && m.distanceM >= m.goalM;
  });

  const hasEarlyBird = sorted.some((s) => {
    const start = parseTimeRangeStartMin(s.metrics?.timeRange);
    return start != null && start < 7 * 60;
  });

  const hasNightOwl = sorted.some((s) => {
    const start = parseTimeRangeStartMin(s.metrics?.timeRange);
    return start != null && start >= 20 * 60;
  });

  const hasComeback = sorted.some((s, i) => {
    if (i === 0) return false;
    const gap = (new Date(s.date) - new Date(sorted[i - 1].date)) / 86400000;
    return gap >= 30;
  });

  const hasHolidaySplash = sorted.some((s) => isHolidaySplashDate(s.date));
  const hasJanuaryJolt = sorted.some((s) => parseInt(s.date.slice(5, 7), 10) === 1);

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
    maxDurationSec,
    maxLapsSession,
    maxActiveKcalSession,
    maxHeartRate,
    maxBreaststrokeM,
    totalLaps,
    maxConsecutiveDays,
    maxSessionsInDay,
    hasGoalCrusher,
    hasEarlyBird,
    hasNightOwl,
    hasComeback,
    hasHolidaySplash,
    hasJanuaryJolt,
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
  { id: 'fifty_sessions', category: 'milestone', tier: 'silver' },
  { id: 'two_hundred_k', category: 'milestone', tier: 'gold' },
  { id: 'lap_legend', category: 'milestone', tier: 'silver' },
  { id: 'calorie_collector', category: 'milestone', tier: 'gold' },
  // Session records
  { id: 'two_k_session', category: 'distance', tier: 'bronze' },
  { id: 'two_five_k_session', category: 'distance', tier: 'silver' },
  { id: 'three_k_session', category: 'distance', tier: 'gold' },
  { id: 'sub_200_pace', category: 'distance', tier: 'gold' },
  { id: 'sub_210_pace', category: 'distance', tier: 'silver' },
  { id: 'marathon_session', category: 'distance', tier: 'gold' },
  { id: 'century_laps', category: 'distance', tier: 'silver' },
  { id: 'furnace', category: 'distance', tier: 'silver' },
  { id: 'pulse_racer', category: 'distance', tier: 'bronze' },
  { id: 'goal_crusher', category: 'distance', tier: 'bronze' },
  { id: 'frog_master', category: 'distance', tier: 'bronze' },
  // Weekly
  { id: 'four_sessions_week', category: 'weekly', tier: 'silver' },
  { id: 'five_k_week', category: 'weekly', tier: 'bronze' },
  // Streaks
  { id: 'hat_trick', category: 'streak', tier: 'bronze' },
  { id: 'week_warrior', category: 'streak', tier: 'silver' },
  { id: 'fortnight_flow', category: 'streak', tier: 'gold' },
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
  // Special
  { id: 'early_bird', category: 'special', tier: 'bronze' },
  { id: 'night_owl', category: 'special', tier: 'bronze' },
  { id: 'comeback', category: 'special', tier: 'silver' },
  { id: 'double_dip', category: 'special', tier: 'bronze' },
  { id: 'holiday_splash', category: 'special', tier: 'silver' },
  { id: 'january_jolt', category: 'special', tier: 'bronze' },
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
    case 'fifty_sessions':
      return { earned: ctx.totalSessions >= 50, periods: [] };
    case 'two_hundred_k':
      return { earned: ctx.totalDistanceM >= 200000, periods: [] };
    case 'lap_legend':
      return { earned: ctx.totalLaps >= 1000, periods: [] };
    case 'calorie_collector':
      return { earned: ctx.totalActiveKcal >= 25000, periods: [] };
    case 'two_k_session':
      return { earned: ctx.maxDistance >= 2000, periods: [] };
    case 'two_five_k_session':
      return { earned: ctx.maxDistance >= 2500, periods: [] };
    case 'three_k_session':
      return { earned: ctx.maxDistance >= 3000, periods: [] };
    case 'sub_200_pace':
      return { earned: ctx.bestPace != null && ctx.bestPace <= 120, periods: [] };
    case 'sub_210_pace':
      return { earned: ctx.bestPace != null && ctx.bestPace <= 130, periods: [] };
    case 'marathon_session':
      return { earned: ctx.maxDurationSec >= 5400, periods: [] };
    case 'century_laps':
      return { earned: ctx.maxLapsSession >= 100, periods: [] };
    case 'furnace':
      return { earned: ctx.maxActiveKcalSession >= 800, periods: [] };
    case 'pulse_racer':
      return { earned: ctx.maxHeartRate >= 155, periods: [] };
    case 'goal_crusher':
      return { earned: ctx.hasGoalCrusher, periods: [] };
    case 'frog_master':
      return { earned: ctx.maxBreaststrokeM >= 1000, periods: [] };
    case 'four_sessions_week':
      return { earned: ctx.maxSessionsInWeek >= 4, periods: [] };
    case 'five_k_week':
      return { earned: ctx.maxDistanceInWeek >= 5000, periods: [] };
    case 'hat_trick':
      return { earned: ctx.maxConsecutiveDays >= 3, periods: [] };
    case 'week_warrior':
      return { earned: ctx.maxConsecutiveDays >= 7, periods: [] };
    case 'fortnight_flow':
      return { earned: ctx.maxConsecutiveDays >= 14, periods: [] };
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
    case 'early_bird':
      return { earned: ctx.hasEarlyBird, periods: [] };
    case 'night_owl':
      return { earned: ctx.hasNightOwl, periods: [] };
    case 'comeback':
      return { earned: ctx.hasComeback, periods: [] };
    case 'double_dip':
      return { earned: ctx.maxSessionsInDay >= 2, periods: [] };
    case 'holiday_splash':
      return { earned: ctx.hasHolidaySplash, periods: [] };
    case 'january_jolt':
      return { earned: ctx.hasJanuaryJolt, periods: [] };
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

export const getNewlyEarnedMedals = (sessionsBefore, sessionsAfter) => {
  const beforeEarned = new Set(
    evaluateAllMedals(sessionsBefore).filter((m) => m.earned).map((m) => m.id)
  );
  return evaluateAllMedals(sessionsAfter).filter((m) => m.earned && !beforeEarned.has(m.id));
};

/** @internal */
export const __testing = { buildMedalContext, getWeekKey, getSeason, getNewlyEarnedMedals };
