/** Helpers for checking whether new swim sessions may exist since the last saved entry. */

export const getLastSessionDate = (sessions = []) => {
  if (!sessions.length) return null;
  return sessions.reduce((latest, session) => {
    const date = session?.date;
    if (!date) return latest;
    return !latest || date > latest ? date : latest;
  }, null);
};

export const daysSinceDate = (isoDate, now = new Date()) => {
  if (!isoDate) return null;
  const then = new Date(isoDate);
  if (Number.isNaN(then.getTime())) return null;
  return Math.round((now - then) / (1000 * 60 * 60 * 24));
};

export const daysSinceLastSession = (sessions, now = new Date()) =>
  daysSinceDate(getLastSessionDate(sessions), now);

/**
 * Web/PWA: nudge the swimmer to upload when nothing new has been logged recently.
 * iOS uses HealthKit auto-sync instead (see SwimViewModel).
 */
export const shouldPromptUploadSync = (sessions, now = new Date(), minDays = 7) => {
  const days = daysSinceLastSession(sessions, now);
  return days != null && days >= minDays;
};

/** ISO date string for HealthKit / sync lookback — day before last session, or fallback months. */
export const getSyncSinceDate = (sessions, { fallbackMonths = 3, now = new Date() } = {}) => {
  const last = getLastSessionDate(sessions);
  if (last) {
    const d = new Date(last);
    if (!Number.isNaN(d.getTime())) {
      d.setDate(d.getDate() - 1);
      return d;
    }
  }
  const fallback = new Date(now);
  fallback.setMonth(fallback.getMonth() - fallbackMonths);
  return fallback;
};
