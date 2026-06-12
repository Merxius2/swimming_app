/**
 * Personalized monthly challenges derived from recent swim history.
 * Three challenges are generated at the start of each month (deterministic).
 * Complete 1 → bronze, 2 → silver, 3 → gold for that month.
 */

const CHALLENGE_TYPES = ['sessions', 'distance', 'kcal', 'streak', 'active_weeks'];

const roundUp = (value, step) => Math.ceil(value / step) * step;

const monthKeyFromDate = (dateStr) => dateStr.slice(0, 7);

export const getMonthKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const hashMonth = (monthKey) => {
  let h = 0;
  for (let i = 0; i < monthKey.length; i += 1) {
    h = (h * 31 + monthKey.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
};

const getWeekKey = (dateStr) => {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().slice(0, 10);
};

const maxConsecutiveDaysInMonth = (sessions, monthKey) => {
  const dates = [...new Set(
    sessions.filter((s) => s.date.startsWith(monthKey)).map((s) => s.date)
  )].sort();
  if (!dates.length) return 0;
  let max = 1;
  let streak = 1;
  for (let i = 1; i < dates.length; i += 1) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = Math.round((curr - prev) / 86400000);
    streak = diff === 1 ? streak + 1 : 1;
    max = Math.max(max, streak);
  }
  return max;
};

const activeWeeksInMonth = (sessions, monthKey) => {
  const weeks = new Set(
    sessions.filter((s) => s.date.startsWith(monthKey)).map((s) => getWeekKey(s.date))
  );
  return weeks.size;
};

export const computeRecentMonthlyStats = (sessions, beforeMonthKey) => {
  const byMonth = {};
  sessions.forEach((s) => {
    const mk = monthKeyFromDate(s.date);
    if (mk >= beforeMonthKey) return;
    if (!byMonth[mk]) byMonth[mk] = { sessions: 0, distanceM: 0, activeKcal: 0, streak: 0 };
    byMonth[mk].sessions += 1;
    byMonth[mk].distanceM += s.metrics?.distanceM || 0;
    byMonth[mk].activeKcal += s.metrics?.activeKcal || 0;
  });

  const months = Object.keys(byMonth).sort().slice(-3);
  if (!months.length) {
    return { avgSessions: 4, avgDistance: 6000, avgKcal: 2500, avgStreak: 2, avgWeeks: 2 };
  }

  const totals = months.reduce(
    (acc, mk) => {
      acc.sessions += byMonth[mk].sessions;
      acc.distanceM += byMonth[mk].distanceM;
      acc.activeKcal += byMonth[mk].activeKcal;
      return acc;
    },
    { sessions: 0, distanceM: 0, activeKcal: 0 }
  );

  const n = months.length;
  const streaks = months.map((mk) => maxConsecutiveDaysInMonth(sessions, mk));
  const weeks = months.map((mk) => activeWeeksInMonth(sessions, mk));

  return {
    avgSessions: Math.max(1, Math.round(totals.sessions / n)),
    avgDistance: Math.max(1000, Math.round(totals.distanceM / n)),
    avgKcal: Math.max(500, Math.round(totals.activeKcal / n)),
    avgStreak: Math.max(1, Math.round(streaks.reduce((a, b) => a + b, 0) / n)),
    avgWeeks: Math.max(1, Math.round(weeks.reduce((a, b) => a + b, 0) / n)),
  };
};

const buildTarget = (type, stats, tierIndex) => {
  const stretch = 1 + tierIndex * 0.12;
  switch (type) {
    case 'sessions':
      return Math.max(3, roundUp(stats.avgSessions * stretch, 1));
    case 'distance':
      return Math.max(4000, roundUp(stats.avgDistance * stretch, 500));
    case 'kcal':
      return Math.max(1500, roundUp(stats.avgKcal * stretch, 250));
    case 'streak':
      return Math.max(2, Math.min(7, stats.avgStreak + tierIndex));
    case 'active_weeks':
      return Math.max(2, Math.min(4, stats.avgWeeks + tierIndex - 1));
    default:
      return 1;
  }
};

const pickChallengeTypes = (monthKey) => {
  const seed = hashMonth(monthKey);
  const pool = [...CHALLENGE_TYPES];
  const picked = [];
  let s = seed || 1;
  for (let i = 0; i < 3; i += 1) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const at = s % pool.length;
    picked.push(pool.splice(at, 1)[0]);
  }
  return picked;
};

export const generateMonthlyChallenges = (sessions, monthKey) => {
  const stats = computeRecentMonthlyStats(sessions, monthKey);
  const types = pickChallengeTypes(monthKey);

  return types.map((type, i) => ({
    id: `${monthKey}_${type}`,
    type,
    monthKey,
    target: buildTarget(type, stats, i),
    tierIndex: i,
  }));
};

const measureChallenge = (type, monthSessions, monthKey) => {
  switch (type) {
    case 'sessions':
      return monthSessions.length;
    case 'distance':
      return monthSessions.reduce((s, x) => s + (x.metrics?.distanceM || 0), 0);
    case 'kcal':
      return monthSessions.reduce((s, x) => s + (x.metrics?.activeKcal || 0), 0);
    case 'streak':
      return maxConsecutiveDaysInMonth(monthSessions, monthKey);
    case 'active_weeks':
      return activeWeeksInMonth(monthSessions, monthKey);
    default:
      return 0;
  }
};

export const evaluateMonthlyChallenges = (sessions, monthKey = getMonthKey()) => {
  const definitions = generateMonthlyChallenges(sessions, monthKey);
  const monthSessions = sessions.filter((s) => s.date.startsWith(monthKey));

  const challenges = definitions.map((def) => {
    const current = measureChallenge(def.type, monthSessions, monthKey);
    const completed = current >= def.target;
    return { ...def, current, completed };
  });

  const completedCount = challenges.filter((c) => c.completed).length;
  let tier = null;
  if (completedCount >= 3) tier = 'gold';
  else if (completedCount >= 2) tier = 'silver';
  else if (completedCount >= 1) tier = 'bronze';

  const earnedAt = tier && monthSessions.length
    ? monthSessions[monthSessions.length - 1].date
    : null;

  return { monthKey, challenges, completedCount, tier, earnedAt };
};

const tierRank = (tier) => ({ bronze: 1, silver: 2, gold: 3 }[tier] || 0);

export const getMonthlyTierUpgrade = (sessionsBefore, sessionsAfter, monthKey = getMonthKey()) => {
  const before = evaluateMonthlyChallenges(sessionsBefore, monthKey);
  const after = evaluateMonthlyChallenges(sessionsAfter, monthKey);
  if (tierRank(after.tier) > tierRank(before.tier)) {
    return {
      monthKey,
      tier: after.tier,
      fromTier: before.tier,
      completedCount: after.completedCount,
      earnedAt: after.earnedAt,
    };
  }
  return null;
};

export const getMonthlyChallengeHistory = (sessions, { previewMonthlyMedals = false } = {}) => {
  const months = [...new Set(sessions.map((s) => monthKeyFromDate(s.date)))].sort().reverse();
  const real = months
    .map((monthKey) => evaluateMonthlyChallenges(sessions, monthKey))
    .filter((m) => m.tier);

  if (!previewMonthlyMedals) return real;

  const preview = getPreviewMonthlyMedalHistory(sessions);
  const realKeys = new Set(real.map((m) => m.monthKey));
  return [
    ...preview.filter((p) => !realKeys.has(p.monthKey)),
    ...real,
  ].sort((a, b) => b.monthKey.localeCompare(a.monthKey));
};

/** @internal Sample bronze / silver / gold months for UI testing. */
export const buildPreviewMonthlyMedal = (sessions, monthKey, tier) => {
  const state = evaluateMonthlyChallenges(sessions, monthKey);
  const completedCount = tier === 'gold' ? 3 : tier === 'silver' ? 2 : 1;
  const challenges = state.challenges.map((ch, i) => ({
    ...ch,
    completed: i < completedCount,
    current: i < completedCount ? ch.target : Math.max(0, Math.floor(ch.target * 0.4)),
  }));
  const earnedDay = String(Math.min(28, 10 + completedCount * 5)).padStart(2, '0');

  return {
    monthKey,
    challenges,
    completedCount,
    tier,
    earnedAt: `${monthKey}-${earnedDay}`,
    isPreview: true,
  };
};

export const getPreviewMonthlyMedalHistory = (sessions, date = new Date()) => {
  const tiers = ['gold', 'silver', 'bronze'];
  return tiers.map((tier, i) => {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    return buildPreviewMonthlyMedal(sessions, getMonthKey(d), tier);
  });
};

/** One medal per calendar month for a year (tier null if not yet earned). */
export const getMonthlyMedalsForYear = (sessions, year = new Date().getFullYear()) => {
  const months = [];
  for (let m = 1; m <= 12; m += 1) {
    const monthKey = `${year}-${String(m).padStart(2, '0')}`;
    const state = evaluateMonthlyChallenges(sessions, monthKey);
    months.push({
      monthKey,
      month: m,
      tier: state.tier,
      completedCount: state.completedCount,
      challenges: state.challenges,
      earnedAt: state.earnedAt,
      hasSessions: sessions.some((s) => s.date.startsWith(monthKey)),
    });
  }
  return months;
};

/** Years that have at least one swim session, sorted descending. */
export const getSessionYears = (sessions) => {
  const years = new Set(
    sessions.map((s) => parseInt(s.date.slice(0, 4), 10)).filter(Boolean)
  );
  return [...years].sort((a, b) => b - a);
};

/** @internal */
export const __testing = {
  pickChallengeTypes,
  computeRecentMonthlyStats,
  buildTarget,
  tierRank,
};
