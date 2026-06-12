/**
 * Swim coin rewards — earned from sessions and medals.
 * Stored in swim data; usage TBD.
 */

const TIER_COINS = { bronze: 25, silver: 60, gold: 150 };
const MONTHLY_TIER_COINS = { bronze: 30, silver: 75, gold: 180 };

export const medalTierCoins = (tier) => TIER_COINS[tier] || 0;

export const monthlyTierCoins = (tier) => (tier ? MONTHLY_TIER_COINS[tier] || 0 : 0);

export const monthlyTierCoinDelta = (fromTier, toTier) =>
  monthlyTierCoins(toTier) - monthlyTierCoins(fromTier);

/** Coins for a single swim session based on effort and performance. */
export const calculateSessionCoins = (session, priorSessions = []) => {
  const m = session.metrics || {};
  let coins = 8; // base attendance

  const distance = m.distanceM || 0;
  const duration = m.durationSec || 0;
  const kcal = m.activeKcal || 0;
  const pace = m.paceSecPer100m;

  coins += Math.floor(distance / 500); // 1 per 500 m
  coins += Math.floor(duration / 900); // 1 per 15 min
  coins += Math.floor(kcal / 100); // 1 per 100 kcal

  if (distance >= 3000) coins += 10;
  if (distance >= 5000) coins += 15;
  if (duration >= 3600) coins += 8;

  const priorPaces = priorSessions
    .map((s) => s.metrics?.paceSecPer100m)
    .filter((p) => p != null && p > 0);
  if (pace != null && priorPaces.length > 0) {
    const avgPace = priorPaces.reduce((a, b) => a + b, 0) / priorPaces.length;
    if (pace < avgPace) {
      const improvement = Math.min(20, Math.floor((avgPace - pace) / 3));
      coins += improvement;
    }
  }

  return Math.max(5, coins);
};

/** Full coin breakdown when saving a session. */
export const calculateUploadCoins = ({
  session,
  sessionsBefore = [],
  newMedals = [],
  monthlyUpgrade = null,
}) => {
  const sessionCoins = calculateSessionCoins(session, sessionsBefore);
  const medalCoins = newMedals.reduce((sum, m) => sum + medalTierCoins(m.tier), 0);
  const monthlyCoins = monthlyUpgrade
    ? monthlyTierCoinDelta(monthlyUpgrade.fromTier, monthlyUpgrade.tier)
    : 0;

  return {
    sessionCoins,
    medalCoins,
    monthlyCoins,
    total: sessionCoins + medalCoins + monthlyCoins,
  };
};

/** Recompute wallet total from stored session coin fields. */
export const sumSessionCoins = (sessions) =>
  (sessions || []).reduce((sum, s) => sum + (s.coinsEarned || 0), 0);

/** Backfill coinsEarned on legacy sessions (one-time style migration). */
export const migrateSessionCoins = (sessions) => {
  const sorted = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
  return sorted.map((session, i) => {
    if (session.coinsEarned != null) return session;
    const prior = sorted.slice(0, i);
    return { ...session, coinsEarned: calculateSessionCoins(session, prior) };
  });
};

/** @internal */
export const __testing = { TIER_COINS, MONTHLY_TIER_COINS };
