import { formatDistance, formatPace } from './swimFormatters.js';
import {
  getBenchmarkForProfile,
  getSwimLevel,
  computePacePercentile,
} from './swimBenchmarks.js';
import { getMascotGameplay, resolveMascotId } from './mascotConstants.js';
import { resolveSessionMascotMood } from './mascotMood.js';
import { evaluateMonthlyChallenges, getMonthKey } from './swimMonthlyChallenges.js';
import {
  applyMessagePlaceholders,
  wrapCoachMessage,
} from './swimProfile.js';

const STROKE_KEYS = ['mixedM', 'breaststrokeM', 'freestyleM', 'backstrokeM', 'butterflyM'];
const STROKE_I18N = {
  mixedM: 'strokes.mixed',
  breaststrokeM: 'strokes.breaststroke',
  freestyleM: 'strokes.freestyle',
  backstrokeM: 'strokes.backstroke',
  butterflyM: 'strokes.butterfly',
};

const makeTr = (t) => (key, params = {}) => {
  let str = typeof t === 'function' ? t(key) : key;
  Object.entries(params).forEach(([k, v]) => {
    str = str.replaceAll(`{${k}}`, v != null && v !== '' ? String(v) : '—');
  });
  return str.replace(/\{[a-zA-Z]+\}/g, '—');
};

const monthKeyFromDate = (dateStr) => dateStr.slice(0, 7);

const shiftMonthKey = (monthKey, delta) => {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const isStatsSession = (session) => !session?.excludeFromStats;

export const getStatsSessions = (sessions) => (sessions || []).filter(isStatsSession);

const sortSessions = (sessions) => [...sessions].sort(
  (a, b) => new Date(a.date) - new Date(b.date)
);

const getPreviousSession = (sessions, currentId) => {
  const sorted = sortSessions(sessions);
  const idx = sorted.findIndex((s) => s.id === currentId);
  if (idx <= 0) return null;
  return sorted[idx - 1];
};

const getPersonalBests = (sessions, excludeId) => {
  const others = sessions.filter((s) => s.id !== excludeId);
  return {
    fastestPace: others.reduce((best, s) => {
      const p = s.metrics?.paceSecPer100m;
      if (p == null) return best;
      return best == null || p < best ? p : best;
    }, null),
    longestDistance: others.reduce((best, s) => {
      const d = s.metrics?.distanceM;
      if (d == null) return best;
      return best == null || d > best ? d : best;
    }, null),
    mostLaps: others.reduce((best, s) => {
      const l = s.metrics?.laps;
      if (l == null) return best;
      return best == null || l > best ? l : best;
    }, null),
  };
};

const getDaysSincePrevious = (sessions, currentId, currentDate) => {
  const previous = getPreviousSession(sessions, currentId);
  if (!previous?.date) return null;
  return Math.round(
    (new Date(currentDate) - new Date(previous.date)) / (1000 * 60 * 60 * 24)
  );
};

const getRecentPriorSessions = (sessions, currentId, limit = 5) => {
  const sorted = sortSessions(sessions);
  const idx = sorted.findIndex((s) => s.id === currentId);
  if (idx <= 0) return [];
  return sorted.slice(Math.max(0, idx - limit), idx);
};

const getMonthDistance = (sessions, monthKey) => sessions
  .filter((s) => s.date.startsWith(monthKey))
  .reduce((sum, s) => sum + (s.metrics?.distanceM || 0), 0);

const getDominantStroke = (strokes = {}) => {
  const entries = STROKE_KEYS
    .map((key) => [key, strokes[key] || 0])
    .filter(([, value]) => value > 0);
  if (!entries.length) return null;
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  const [key, value] = entries.sort((a, b) => b[1] - a[1])[0];
  return { key, meters: value, share: value / total };
};

const hasPersonalBestBadge = (badges) => badges.length > 0;

const buildHighlights = (ctx, tr) => {
  const { m, benchmarkLevel, weeklyVolume, recentAvgPace, percentile } = ctx;
  const highlights = [];

  if (m.paceSecPer100m != null) {
    highlights.push({
      label: tr('feedback.highlightPace'),
      value: formatPace(m.paceSecPer100m),
    });
  }
  if (m.distanceM != null) {
    highlights.push({
      label: tr('feedback.highlightDistance'),
      value: formatDistance(m.distanceM),
    });
  }
  if (benchmarkLevel && benchmarkLevel !== 'unknown') {
    highlights.push({
      label: tr('feedback.highlightLevel'),
      value: tr(`benchmark.levels.${benchmarkLevel}`),
    });
  }
  if (weeklyVolume > 0) {
    highlights.push({
      label: tr('feedback.highlightWeek'),
      value: formatDistance(weeklyVolume),
    });
  }
  if (percentile != null && m.paceSecPer100m != null) {
    highlights.push({
      label: tr('feedback.highlightPercentile'),
      value: tr('feedback.percentileValue', { percentile }),
    });
  } else if (recentAvgPace != null && m.paceSecPer100m != null) {
    const delta = Math.round(recentAvgPace - m.paceSecPer100m);
    if (delta !== 0) {
      highlights.push({
        label: tr('feedback.highlightVsRecent'),
        value: delta > 0
          ? tr('feedback.vsRecentFasterShort', { seconds: delta })
          : tr('feedback.vsRecentSlowerShort', { seconds: Math.abs(delta) }),
      });
    }
  }

  return highlights.slice(0, 4);
};

const buildCoachingTip = (ctx, tr) => {
  const {
    m,
    previous,
    recentAvgDistance,
    recentAvgPace,
    daysSinceLast,
    dominantStroke,
    benchmarkLevel,
    paceTrendDelta,
    isFirst,
  } = ctx;

  if (isFirst) return tr('feedback.tipFirst');

  if (daysSinceLast != null && daysSinceLast >= 10) {
    return tr('feedback.tipConsistency', { days: daysSinceLast });
  }

  if (
    previous?.metrics?.paceSecPer100m != null
    && m.paceSecPer100m != null
    && m.avgHeartRate != null
    && previous.metrics.avgHeartRate != null
    && m.paceSecPer100m > previous.metrics.paceSecPer100m + 4
    && m.avgHeartRate >= previous.metrics.avgHeartRate + 5
  ) {
    return tr('feedback.tipRecovery');
  }

  if (benchmarkLevel === 'developing') {
    return tr('feedback.tipDeveloping');
  }

  if (dominantStroke && dominantStroke.share >= 0.8) {
    return tr('feedback.tipStrokeVariety', {
      stroke: tr(STROKE_I18N[dominantStroke.key] || 'strokes.mixed'),
      percent: Math.round(dominantStroke.share * 100),
    });
  }

  if (
    recentAvgDistance != null
    && m.distanceM != null
    && m.paceSecPer100m != null
    && recentAvgPace != null
    && m.distanceM < recentAvgDistance * 0.75
    && m.paceSecPer100m <= recentAvgPace - 3
  ) {
    return tr('feedback.tipBuildDistance');
  }

  if (paceTrendDelta != null && paceTrendDelta <= -4) {
    return tr('feedback.tipSlowingTrend');
  }

  if (paceTrendDelta != null && paceTrendDelta >= 4) {
    return tr('feedback.tipImprovingTrend');
  }

  if (m.goalM && m.distanceM != null && m.distanceM < m.goalM) {
    return tr('feedback.tipNearGoal', { meters: m.goalM - m.distanceM });
  }

  return trVariant(tr, 'feedback.tipDefault', 3, `${ctx.newSession.date}-tip`);
};

import { isPositiveInsight } from './insightPolarity.js';
import { trVariant } from './feedbackVariants.js';

const buildCoachNarrative = (ctx, tr, coachGameplay = {}) => {
  const {
    isFirst,
    m,
    daysSinceLast,
    paceDeltaVsRecent,
    paceDeltaVsPrevious,
    benchmarkLevel,
    paceTrendDelta,
    monthDistance,
    prevMonthDistance,
    hasPb,
  } = ctx;

  if (isFirst) return tr('feedback.firstSession');

  const parts = [];

  if (hasPb) {
    parts.push(tr('feedback.coachPersonalBest'));
  } else if (daysSinceLast != null && daysSinceLast >= 14) {
    parts.push(tr('feedback.coachComeback', { days: daysSinceLast }));
  } else if (paceDeltaVsRecent != null && paceDeltaVsRecent >= 5) {
    parts.push(tr('feedback.coachStrongSession', { seconds: Math.round(paceDeltaVsRecent) }));
  } else if (
    paceDeltaVsPrevious != null
    && paceDeltaVsPrevious <= -5
    && coachGameplay.sessionPenalty
  ) {
    parts.push(tr('feedback.coachCriticalSession'));
  } else if (
    paceDeltaVsPrevious != null
    && paceDeltaVsPrevious <= -5
    && m.avgHeartRate != null
  ) {
    parts.push(trVariant(tr, 'feedback.coachRecovery', 2, `${ctx.newSession.date}-recovery`));
  } else {
    parts.push(trVariant(tr, 'feedback.welcomeBack', 3, `${ctx.newSession.date}-${m.distanceM || 0}`, {
      distance: formatDistance(m.distanceM),
      pace: formatPace(m.paceSecPer100m),
    }));
  }

  if (benchmarkLevel && benchmarkLevel !== 'unknown') {
    parts.push(tr('feedback.coachBenchmark', {
      level: tr(`benchmark.levels.${benchmarkLevel}`),
    }));
  }

  if (paceTrendDelta != null && paceTrendDelta >= 4) {
    parts.push(tr('feedback.coachTrendUp'));
  } else if (monthDistance > 0 && prevMonthDistance > 0) {
    const change = Math.round(((monthDistance - prevMonthDistance) / prevMonthDistance) * 100);
    if (change >= 15) {
      parts.push(tr('feedback.coachMonthUp', { percent: change }));
    } else if (change <= -15 && !coachGameplay.positiveOnly) {
      parts.push(tr('feedback.coachMonthDown'));
    }
  }

  return parts.join(' ');
};

const enrichInsights = (base, ctx, tr) => {
  const insights = [...base.insights];
  const {
    m,
    recentAvgPace,
    recentAvgDistance,
    combinedAvgPace,
    daysSinceLast,
    benchmark,
    benchmarkLevel,
    monthDistance,
    prevMonthDistance,
    dominantStroke,
    paceTrendDelta,
    recentPrior,
    isFirst,
  } = ctx;

  if (!isFirst && recentCount(ctx, 7) >= 3) {
    insights.unshift(tr('feedback.streak', { count: recentCount(ctx, 7) }));
  }

  if (recentAvgPace != null && m.paceSecPer100m != null) {
    const delta = Math.round(recentAvgPace - m.paceSecPer100m);
    if (delta >= 3) {
      insights.push(tr('feedback.vsRecentAvgFaster', { seconds: delta }));
    } else if (delta <= -3) {
      insights.push(tr('feedback.vsRecentAvgSlower', { seconds: Math.abs(delta) }));
    }
  }

  if (combinedAvgPace != null && m.paceSecPer100m != null && ctx.sessionCount >= 4) {
    const delta = Math.round(combinedAvgPace - m.paceSecPer100m);
    if (Math.abs(delta) >= 3) {
      insights.push(
        delta > 0
          ? tr('feedback.vsAllTimeAvgFaster', { seconds: delta })
          : tr('feedback.vsAllTimeAvgSlower', { seconds: Math.abs(delta) })
      );
    }
  }

  if (recentAvgDistance != null && m.distanceM != null) {
    const diff = m.distanceM - recentAvgDistance;
    if (diff >= 200) {
      insights.push(tr('feedback.longerThanRecent', { distance: formatDistance(diff) }));
    } else if (diff <= -200) {
      insights.push(tr('feedback.shorterThanRecent', { distance: formatDistance(Math.abs(diff)) }));
    }
  }

  if (daysSinceLast != null && daysSinceLast > 1) {
    insights.push(tr('feedback.daysSinceLast', { days: daysSinceLast }));
  }

  if (benchmark && m.paceSecPer100m != null && benchmarkLevel !== 'unknown') {
    const medianDelta = Math.round(m.paceSecPer100m - benchmark.median);
    insights.push(tr('feedback.benchmarkLevel', {
      level: tr(`benchmark.levels.${benchmarkLevel}`),
    }));
    if (medianDelta !== 0) {
      insights.push(
        medianDelta < 0
          ? tr('feedback.vsMedianFaster', { seconds: Math.abs(medianDelta) })
          : tr('feedback.vsMedianSlower', { seconds: medianDelta })
      );
    }
  }

  if (monthDistance > 0) {
    if (prevMonthDistance > 0) {
      const change = Math.round(((monthDistance - prevMonthDistance) / prevMonthDistance) * 100);
      insights.push(tr('feedback.monthlyCompare', {
        distance: formatDistance(monthDistance),
        change: change >= 0 ? `+${change}` : String(change),
      }));
    } else {
      insights.push(tr('feedback.monthlyDistance', { distance: formatDistance(monthDistance) }));
    }
  }

  if (m.activeKcal != null && m.activeKcal >= 200) {
    insights.push(tr('feedback.caloriesBurned', { kcal: Math.round(m.activeKcal) }));
  }

  if (m.durationSec != null && m.distanceM != null && m.distanceM > 0) {
    const metersPerMin = (m.distanceM / m.durationSec) * 60;
    if (metersPerMin >= 40) {
      insights.push(tr('feedback.sustainedEffort', { rate: Math.round(metersPerMin) }));
    }
  }

  if (dominantStroke && dominantStroke.share >= 0.55) {
    insights.push(tr('feedback.dominantStroke', {
      stroke: tr(STROKE_I18N[dominantStroke.key] || 'strokes.mixed'),
      percent: Math.round(dominantStroke.share * 100),
    }));
  }

  if (paceTrendDelta != null && recentPrior.length >= 3) {
    if (paceTrendDelta >= 4) {
      insights.push(tr('feedback.trendImproving', { sessions: recentPrior.length }));
    } else if (paceTrendDelta <= -4) {
      insights.push(tr('feedback.trendSlowing', { sessions: recentPrior.length }));
    }
  }

  if (ctx.combined?.sessionCount >= 2) {
    insights.push(tr('feedback.allTimeDistance', {
      distance: formatDistance(ctx.combined.totalDistanceM),
      count: ctx.combined.sessionCount,
    }));
  }

  return [...new Set(insights)];
};

const recentCount = (ctx, days) => {
  const { newSession, allSessions } = ctx;
  return allSessions.filter((s) => {
    const diff = (new Date(newSession.date) - new Date(s.date)) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= days;
  }).length;
};

const gatherFeedbackContext = (newSession, allSessions, profile, base, combined) => {
  const m = newSession.metrics || {};
  const sessionCount = allSessions.length;
  const isFirst = sessionCount === 1;
  const previous = getPreviousSession(allSessions, newSession.id);
  const recentPrior = getRecentPriorSessions(allSessions, newSession.id, 5);
  const recentPaces = recentPrior.map((s) => s.metrics?.paceSecPer100m).filter((v) => v != null);
  const recentDistances = recentPrior.map((s) => s.metrics?.distanceM).filter((v) => v != null);
  const recentAvgPace = avg(recentPaces);
  const recentAvgDistance = avg(recentDistances);
  const combinedAvgPace = combined?.avgPaceSecPer100m ?? null;
  const daysSinceLast = getDaysSincePrevious(allSessions, newSession.id, newSession.date);
  const monthKey = monthKeyFromDate(newSession.date);
  const monthDistance = getMonthDistance(allSessions, monthKey);
  const prevMonthDistance = getMonthDistance(allSessions, shiftMonthKey(monthKey, -1));
  const benchmark = profile?.sex && profile?.age
    ? getBenchmarkForProfile(profile.sex, profile.age)
    : null;
  const benchmarkLevel = benchmark ? getSwimLevel(m.paceSecPer100m, benchmark) : 'unknown';
  const percentile = benchmark && m.paceSecPer100m != null
    ? computePacePercentile(m.paceSecPer100m, benchmark)
    : null;
  const dominantStroke = getDominantStroke(m.strokes);
  const weeklyVolume = getWeeklyVolume(allSessions, newSession.date);

  let paceTrendDelta = null;
  if (recentPaces.length >= 3) {
    const older = avg(recentPaces.slice(0, Math.floor(recentPaces.length / 2)));
    const newer = avg(recentPaces.slice(Math.ceil(recentPaces.length / 2)));
    if (older != null && newer != null) paceTrendDelta = older - newer;
  }

  const paceDeltaVsRecent = recentAvgPace != null && m.paceSecPer100m != null
    ? recentAvgPace - m.paceSecPer100m
    : null;
  const paceDeltaVsPrevious = previous?.metrics?.paceSecPer100m != null && m.paceSecPer100m != null
    ? previous.metrics.paceSecPer100m - m.paceSecPer100m
    : null;

  return {
    newSession,
    allSessions,
    m,
    sessionCount,
    isFirst,
    previous,
    recentPrior,
    recentAvgPace,
    recentAvgDistance,
    combinedAvgPace,
    daysSinceLast,
    monthDistance,
    prevMonthDistance,
    benchmark,
    benchmarkLevel,
    percentile,
    dominantStroke,
    weeklyVolume,
    paceTrendDelta,
    paceDeltaVsRecent,
    paceDeltaVsPrevious,
    hasPb: hasPersonalBestBadge(base.badges),
    combined,
  };
};

const getWeeklyVolume = (sessions, referenceDate) => {
  const ref = new Date(referenceDate);
  const weekStart = new Date(ref);
  weekStart.setDate(ref.getDate() - ref.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);

  return sessions
    .filter((s) => new Date(s.date) >= weekStart)
    .reduce((sum, s) => sum + (s.metrics?.distanceM || 0), 0);
};

export const analyzeSession = (newSession, allSessions, t) => {
  const tr = (key, params) => {
    if (typeof t === 'function') {
      let str = t(key);
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          str = str.replace(`{${k}}`, v);
        });
      }
      return str;
    }
    return key;
  };

  const insights = [];
  const badges = [];
  const m = newSession.metrics || {};
  const previous = getPreviousSession(allSessions, newSession.id);
  const bests = getPersonalBests(allSessions, newSession.id);

  if (previous?.metrics?.paceSecPer100m != null && m.paceSecPer100m != null) {
    const delta = previous.metrics.paceSecPer100m - m.paceSecPer100m;
    if (delta > 0) {
      insights.push(tr('feedback.paceFaster', { seconds: Math.round(delta) }));
    } else if (delta < 0) {
      insights.push(tr('feedback.paceSlower', { seconds: Math.round(Math.abs(delta)) }));
    } else {
      insights.push(tr('feedback.paceSame'));
    }
  }

  if (m.goalM && m.distanceM) {
    const diff = m.distanceM - m.goalM;
    if (diff > 0) {
      insights.push(tr('feedback.overGoal', { meters: diff }));
    } else if (diff < 0) {
      insights.push(tr('feedback.underGoal', { meters: Math.abs(diff) }));
    } else {
      insights.push(tr('feedback.hitGoal'));
    }
  }

  if (previous?.metrics?.avgHeartRate != null && m.avgHeartRate != null) {
    const hrDelta = m.avgHeartRate - previous.metrics.avgHeartRate;
    if (hrDelta > 0) {
      insights.push(tr('feedback.hrHigher', { bpm: hrDelta }));
    } else if (hrDelta < 0) {
      insights.push(tr('feedback.hrLower', { bpm: Math.abs(hrDelta) }));
    }
  }

  if (m.paceSecPer100m != null && bests.fastestPace != null && m.paceSecPer100m <= bests.fastestPace) {
    badges.push(tr('feedback.pbPace'));
  }
  if (m.distanceM != null && bests.longestDistance != null && m.distanceM >= bests.longestDistance) {
    badges.push(tr('feedback.pbDistance'));
  }
  if (m.laps != null && bests.mostLaps != null && m.laps >= bests.mostLaps) {
    badges.push(tr('feedback.pbLaps'));
  }

  const weeklyVolume = getWeeklyVolume(allSessions, newSession.date);
  if (weeklyVolume > 0) {
    insights.push(tr('feedback.weeklyVolume', { distance: formatDistance(weeklyVolume) }));
  }

  if (previous?.metrics?.strokes && m.strokes) {
    const prevBreast = previous.metrics.strokes.breaststrokeM || 0;
    const currBreast = m.strokes.breaststrokeM || 0;
    if (currBreast > prevBreast + 100) {
      insights.push(tr('feedback.moreBreaststroke'));
    }
  }

  return { insights, badges, previous, weeklyVolume };
};

const avg = (values) => {
  const nums = values.filter((v) => v != null && Number.isFinite(v));
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
};

export const getCombinedStats = (sessions) => {
  const statsSessions = getStatsSessions(sessions);
  if (!statsSessions.length) return null;

  const metrics = statsSessions.map((s) => s.metrics || {});
  const totalDistanceM = metrics.reduce((sum, m) => sum + (m.distanceM || 0), 0);
  const totalDurationSec = metrics.reduce((sum, m) => sum + (m.durationSec || 0), 0);
  const totalActiveKcal = metrics.reduce((sum, m) => sum + (m.activeKcal || 0), 0);
  const totalLaps = metrics.reduce((sum, m) => sum + (m.laps || 0), 0);
  const paces = metrics.map((m) => m.paceSecPer100m).filter(Boolean);
  const heartRates = metrics.map((m) => m.avgHeartRate).filter(Boolean);

  const bestPace = paces.length ? Math.min(...paces) : null;
  const longestDistance = metrics.reduce((best, m) => {
    if (m.distanceM == null) return best;
    return best == null || m.distanceM > best ? m.distanceM : best;
  }, null);

  const sorted = sortSessions(statsSessions);
  const firstDate = sorted[0]?.date;
  const lastDate = sorted[sorted.length - 1]?.date;

  return {
    sessionCount: statsSessions.length,
    totalDistanceM,
    totalDurationSec,
    totalActiveKcal,
    totalLaps,
    avgPaceSecPer100m: avg(paces),
    avgHeartRate: avg(heartRates) != null ? Math.round(avg(heartRates)) : null,
    bestPaceSecPer100m: bestPace,
    longestDistanceM: longestDistance,
    firstDate,
    lastDate,
  };
};

const getSessionsForStats = (allSessions, newSession = null) => {
  const statsSessions = getStatsSessions(allSessions);
  if (!newSession || newSession.excludeFromStats) return statsSessions;
  if (statsSessions.some((s) => s.id === newSession.id)) return statsSessions;
  return sortSessions([...statsSessions, newSession]);
};

export const buildPersonalFeedback = (newSession, allSessions, t, profile = {}) => {
  const tr = makeTr(t);
  const sessionsForStats = getSessionsForStats(allSessions, newSession);
  const base = analyzeSession(newSession, sessionsForStats, t);
  const combined = getCombinedStats(sessionsForStats);
  const ctx = gatherFeedbackContext(newSession, sessionsForStats, profile, base, combined);
  const insights = enrichInsights(base, ctx, tr);

  const mascotContext = { sessions: sessionsForStats };
  const coachGameplay = getMascotGameplay(resolveMascotId(profile, mascotContext));

  let usedPaceDownMotivation = false;
  let motivation = '';
  if (ctx.isFirst) {
    motivation = tr('feedback.motivationFirst');
  } else if (ctx.hasPb) {
    motivation = tr('feedback.motivationPersonalBest');
  } else if (ctx.paceDeltaVsPrevious != null && ctx.paceDeltaVsPrevious >= 5) {
    motivation = tr('feedback.motivationPaceUp', { seconds: Math.round(ctx.paceDeltaVsPrevious) });
  } else if (ctx.paceDeltaVsPrevious != null && ctx.paceDeltaVsPrevious <= -5) {
    // Flip never criticises; Fins is openly critical about a slower swim.
    if (coachGameplay.positiveOnly) {
      motivation = trVariant(tr, 'feedback.motivationKeepGoing', 3, newSession.date);
    } else if (coachGameplay.sessionPenalty) {
      motivation = tr('feedback.motivationPaceDownCritical');
      usedPaceDownMotivation = true;
    } else {
      motivation = tr('feedback.motivationPaceDown');
      usedPaceDownMotivation = true;
    }
  } else if (ctx.m.goalM && ctx.m.distanceM >= ctx.m.goalM) {
    motivation = tr('feedback.motivationGoal');
  } else if (ctx.paceTrendDelta != null && ctx.paceTrendDelta >= 4) {
    motivation = tr('feedback.motivationTrendUp');
  } else if (recentCount(ctx, 7) >= 3) {
    motivation = trVariant(tr, 'feedback.motivationConsistent', 2, newSession.date);
  } else {
    motivation = trVariant(tr, 'feedback.motivationKeepGoing', 3, `${newSession.date}-default`);
  }

  let coachMessage = buildCoachNarrative(ctx, tr, coachGameplay);
  const mascotId = resolveMascotId(profile, mascotContext);
  coachMessage = wrapCoachMessage(mascotId, profile, tr, coachMessage);
  if (profile.age && !ctx.isFirst) {
    coachMessage += ` ${tr('feedback.ageNote', { age: profile.age })}`;
  }

  const visibleInsights = coachGameplay.positiveOnly
    ? insights.filter(isPositiveInsight)
    : insights;

  const usedCriticalCoachLine = wasCriticalCoachLine(ctx, coachGameplay);
  const mascotMood = resolveSessionMascotMood({
    mascotId: resolveMascotId(profile, mascotContext),
    isFirst: ctx.isFirst,
    hasPb: ctx.hasPb,
    paceDeltaVsPrevious: ctx.paceDeltaVsPrevious,
    usedCriticalCoachLine,
    usedPaceDownMotivation,
  });

  return {
    insights: visibleInsights,
    badges: base.badges,
    previous: base.previous,
    weeklyVolume: ctx.weeklyVolume,
    coachMessage: coachMessage.trim(),
    motivation,
    highlights: buildHighlights(ctx, tr),
    tip: buildCoachingTip(ctx, tr),
    benchmarkLevel: ctx.benchmarkLevel,
    combined,
    isFirst: ctx.isFirst,
    mascotMood,
  };
};

/** Fins critical coach narrative branch in buildCoachNarrative. */
function wasCriticalCoachLine(ctx, coachGameplay) {
  if (ctx.isFirst || ctx.hasPb) return false;
  if (ctx.daysSinceLast != null && ctx.daysSinceLast >= 14) return false;
  if (ctx.paceDeltaVsRecent != null && ctx.paceDeltaVsRecent >= 5) return false;
  return Boolean(
    coachGameplay.sessionPenalty
    && ctx.paceDeltaVsPrevious != null
    && ctx.paceDeltaVsPrevious <= -5
  );
}

const findClosestIncompleteChallenge = (challenges) => {
  const incomplete = challenges.filter((c) => !c.completed);
  if (!incomplete.length) return null;
  return incomplete.reduce((best, ch) => {
    const ratio = ch.target > 0 ? ch.current / ch.target : 0;
    const bestRatio = best.target > 0 ? best.current / best.target : 0;
    return ratio >= bestRatio ? ch : best;
  });
};

const tierRank = (tier) => ({ bronze: 1, silver: 2, gold: 3 }[tier] || 0);

const formatOverviewChallengeLabel = (type, target, tr) => {
  switch (type) {
    case 'sessions':
      return tr('monthlyChallenges.targets.sessions', { count: target });
    case 'distance':
      return tr('monthlyChallenges.targets.distance', { distance: formatDistance(target) });
    case 'kcal':
      return tr('monthlyChallenges.targets.kcal', { kcal: target });
    case 'streak':
      return tr('monthlyChallenges.targets.streak', { days: target });
    case 'active_weeks':
      return tr('monthlyChallenges.targets.activeWeeks', { weeks: target });
    default:
      return String(target);
  }
};

const formatOverviewChallengeValue = (type, value, tr) => {
  if (value == null) return '—';
  switch (type) {
    case 'distance':
      return formatDistance(value);
    case 'kcal':
      return `${value.toLocaleString()} ${tr('common.kcal')}`;
    default:
      return String(value);
  }
};

/** Big-picture coach copy for the Progress page header — overall stats + monthly goals. */
export const buildProgressOverviewMessage = (
  sessions,
  profile,
  t,
  { monthlyChallengeRerolls = {} } = {}
) => {
  const tr = makeTr(t);
  const mascotId = resolveMascotId(profile, { sessions, monthlyChallengeRerolls });
  const gameplay = getMascotGameplay(mascotId);
  const statsSessions = getStatsSessions(sessions);
  const combined = getCombinedStats(sessions);

  if (!combined || !statsSessions.length) {
    return applyMessagePlaceholders(tr('progress.mascotEmpty'), profile, tr);
  }

  const monthKey = getMonthKey();
  const monthly = evaluateMonthlyChallenges(
    sessions,
    monthKey,
    monthlyChallengeRerolls,
    gameplay.challengeIntensity
  );
  const monthDistance = getMonthDistance(statsSessions, monthKey);
  const prevMonthDistance = getMonthDistance(statsSessions, shiftMonthKey(monthKey, -1));
  const parts = [];

  if (combined.sessionCount === 1) {
    parts.push(tr('progress.overviewSingleSession'));
  } else {
    parts.push(tr('progress.overviewSessions', {
      count: combined.sessionCount,
      distance: formatDistance(combined.totalDistanceM),
      pace: formatPace(combined.avgPaceSecPer100m),
    }));
  }

  if (monthDistance > 0) {
    if (prevMonthDistance > 0) {
      const change = Math.round(((monthDistance - prevMonthDistance) / prevMonthDistance) * 100);
      if (change >= 10) {
        parts.push(tr('progress.overviewMonthVolumeUp', {
          distance: formatDistance(monthDistance),
          percent: change,
        }));
      } else if (change <= -10 && !gameplay.positiveOnly) {
        parts.push(tr('progress.overviewMonthVolumeDown', {
          distance: formatDistance(monthDistance),
        }));
      } else {
        parts.push(tr('progress.overviewMonthVolume', {
          distance: formatDistance(monthDistance),
        }));
      }
    } else {
      parts.push(tr('progress.overviewMonthVolume', {
        distance: formatDistance(monthDistance),
      }));
    }
  }

  if (monthly.completedCount >= 3) {
    parts.push(tr('progress.overviewMonthlyGold'));
  } else if (monthly.completedCount === 2) {
    parts.push(tr('progress.overviewMonthlySilver'));
  } else if (monthly.completedCount === 1) {
    parts.push(tr('progress.overviewMonthlyBronze', { remaining: 2 }));
  } else {
    const next = findClosestIncompleteChallenge(monthly.challenges);
    if (next) {
      const challenge = formatOverviewChallengeLabel(next.type, next.target, tr);
      const current = formatOverviewChallengeValue(next.type, next.current, tr);
      const target = formatOverviewChallengeValue(next.type, next.target, tr);
      const key = gameplay.positiveOnly
        ? 'progress.overviewMonthlyNoneFlip'
        : 'progress.overviewMonthlyNone';
      parts.push(tr(key, { challenge, current, target }));
    }
  }

  if (gameplay.requiredMonthlyTier) {
    const requiredRank = tierRank(gameplay.requiredMonthlyTier);
    const currentRank = tierRank(monthly.tier);
    if (currentRank < requiredRank) {
      parts.push(tr('progress.overviewCoachRequirement', {
        tier: tr(`monthlyChallenges.tiers.${gameplay.requiredMonthlyTier}`),
        amount: gameplay.monthlyPenaltyCoins,
      }));
    }
  }

  let message = parts.filter(Boolean).join(' ');
  if (!message.trim()) {
    message = applyMessagePlaceholders(tr('progress.mascotDefault'), profile, tr);
  }

  return wrapCoachMessage(mascotId, profile, tr, message);
};

export const getChartSessions = (sessions) => sortSessions(getStatsSessions(sessions)).map((s) => ({
  id: s.id,
  date: s.date,
  dateLabel: s.date,
  paceSecPer100m: s.metrics?.paceSecPer100m,
  paceLabel: formatPace(s.metrics?.paceSecPer100m),
  distanceM: s.metrics?.distanceM,
  activeKcal: s.metrics?.activeKcal,
  totalKcal: s.metrics?.totalKcal,
  avgHeartRate: s.metrics?.avgHeartRate,
  laps: s.metrics?.laps,
  strokes: s.metrics?.strokes,
}));

export const getWeeklyVolumeData = (sessions) => {
  const byWeek = {};
  sortSessions(getStatsSessions(sessions)).forEach((s) => {
    const d = new Date(s.date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay() + 1);
    const key = weekStart.toISOString().slice(0, 10);
    byWeek[key] = (byWeek[key] || 0) + (s.metrics?.distanceM || 0);
  });
  return Object.entries(byWeek).map(([week, distanceM]) => ({
    week,
    weekLabel: new Date(week).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }),
    distanceM,
  }));
};

export const getStrokeChartData = (session, t) => {
  if (!session?.metrics?.strokes) return [];
  const labels = {
    mixedM: t('strokes.mixed'),
    breaststrokeM: t('strokes.breaststroke'),
    freestyleM: t('strokes.freestyle'),
    backstrokeM: t('strokes.backstroke'),
    butterflyM: t('strokes.butterfly'),
  };
  return Object.entries(session.metrics.strokes)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: labels[key] || key,
      value,
    }));
};
