/**
 * Detect duplicate swim sessions (same workout uploaded twice).
 */

const PACE_TOLERANCE_SEC = 5;

const coreMetricsMatch = (a, b) => {
  if (a.date !== b.date) return false;

  const ma = a.metrics || {};
  const mb = b.metrics || {};

  if (ma.distanceM == null || mb.distanceM == null) return false;
  if (ma.durationSec == null || mb.durationSec == null) return false;

  if (ma.distanceM !== mb.distanceM || ma.durationSec !== mb.durationSec) return false;

  if (ma.paceSecPer100m != null && mb.paceSecPer100m != null) {
    if (Math.abs(ma.paceSecPer100m - mb.paceSecPer100m) > PACE_TOLERANCE_SEC) return false;
  }

  if (ma.timeRange && mb.timeRange && ma.timeRange !== mb.timeRange) return false;

  return true;
};

export const findDuplicateSession = (sessions, candidate, excludeId = null) => {
  if (!candidate?.date || !sessions?.length) return null;

  const match = sessions.find(
    (s) => s.id !== excludeId && coreMetricsMatch(candidate, s)
  );

  return match ?? null;
};

export { coreMetricsMatch };

/** @internal */
export const __testing = { coreMetricsMatch, PACE_TOLERANCE_SEC };
