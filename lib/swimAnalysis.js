import { formatDistance, formatPace } from './swimFormatters.js';

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

export const getChartSessions = (sessions) => sortSessions(sessions).map((s) => ({
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
  sortSessions(sessions).forEach((s) => {
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
