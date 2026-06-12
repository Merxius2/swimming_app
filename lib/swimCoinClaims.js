import { coreMetricsMatch } from './swimDuplicates.js';

/** Total coins awarded when this session was saved. */
export const sessionTotalCoins = (session) =>
  (session?.coinsEarned || 0) + (session?.coinBonus || 0);

/** Fingerprint stored when a session is deleted so coins cannot be re-earned. */
export const createCoinClaim = (session) => ({
  date: session.date,
  metrics: {
    distanceM: session.metrics?.distanceM ?? null,
    durationSec: session.metrics?.durationSec ?? null,
    paceSecPer100m: session.metrics?.paceSecPer100m ?? null,
    timeRange: session.metrics?.timeRange || '',
  },
});

export const findSpentCoinClaim = (claims, candidate) => {
  if (!claims?.length || !candidate?.date) return null;
  return claims.find((claim) => coreMetricsMatch(claim, candidate)) ?? null;
};

/** @internal */
export const __testing = { sessionTotalCoins, createCoinClaim };
