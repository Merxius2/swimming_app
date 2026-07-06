import { formatDateShort } from './swimFormatters.js';
import { getStatsSessions } from './swimAnalysis.js';

const bestSession = (sessions, pickValue, better) => {
  let best = null;
  sessions.forEach((session) => {
    const value = pickValue(session);
    if (value == null || !Number.isFinite(value)) return;
    if (!best || better(value, best.value)) {
      best = { value, sessionId: session.id, date: session.date };
    }
  });
  return best;
};

export const getPersonalRecords = (sessions) => {
  const statsSessions = getStatsSessions(sessions);
  if (!statsSessions.length) return null;

  return {
    longestDistance: bestSession(
      statsSessions,
      (s) => s.metrics?.distanceM,
      (a, b) => a > b
    ),
    fastestPace: bestSession(
      statsSessions,
      (s) => s.metrics?.paceSecPer100m,
      (a, b) => a < b
    ),
    mostActiveCalories: bestSession(
      statsSessions,
      (s) => s.metrics?.activeKcal,
      (a, b) => a > b
    ),
    mostTotalCalories: bestSession(
      statsSessions,
      (s) => s.metrics?.totalKcal,
      (a, b) => a > b
    ),
    mostLaps: bestSession(
      statsSessions,
      (s) => s.metrics?.laps,
      (a, b) => a > b
    ),
    longestDuration: bestSession(
      statsSessions,
      (s) => s.metrics?.durationSec,
      (a, b) => a > b
    ),
    highestHeartRate: bestSession(
      statsSessions,
      (s) => s.metrics?.avgHeartRate,
      (a, b) => a > b
    ),
  };
};

export const formatRecordDate = (date, locale = 'nl-NL') => {
  if (!date) return '—';
  return formatDateShort(date, locale);
};
