/**
 * Swim coin rewards — earned from sessions and medals.
 * Stored in swim data; usage TBD.
 */

import { findSpentCoinClaim } from './swimCoinClaims.js';

const TIER_COINS = { bronze: 25, silver: 60, gold: 150 };
const MONTHLY_TIER_COINS = { bronze: 30, silver: 75, gold: 180 };

export const medalTierCoins = (tier) => TIER_COINS[tier] || 0;

export const monthlyTierCoins = (tier) => (tier ? MONTHLY_TIER_COINS[tier] || 0 : 0);

export const monthlyTierCoinDelta = (fromTier, toTier) =>
  monthlyTierCoins(toTier) - monthlyTierCoins(fromTier);

/** Detailed session coin breakdown with line items for UI. */
export const calculateSessionCoinBreakdown = (session, priorSessions = []) => {
  const m = session.metrics || {};
  const lines = [];
  let coins = 8;

  lines.push({ type: 'base', coins: 8 });

  const distance = m.distanceM || 0;
  const duration = m.durationSec || 0;
  const kcal = m.activeKcal || 0;
  const pace = m.paceSecPer100m;

  const distBonus = Math.floor(distance / 500);
  if (distBonus > 0) {
    coins += distBonus;
    lines.push({ type: 'distance', coins: distBonus, distanceM: distance });
  }

  const durBonus = Math.floor(duration / 900);
  if (durBonus > 0) {
    coins += durBonus;
    lines.push({ type: 'duration', coins: durBonus, durationSec: duration });
  }

  const kcalBonus = Math.floor(kcal / 100);
  if (kcalBonus > 0) {
    coins += kcalBonus;
    lines.push({ type: 'kcal', coins: kcalBonus, kcal });
  }

  if (distance >= 3000) {
    coins += 10;
    lines.push({ type: 'longDistance3k', coins: 10 });
  }
  if (distance >= 5000) {
    coins += 15;
    lines.push({ type: 'longDistance5k', coins: 15 });
  }
  if (duration >= 3600) {
    coins += 8;
    lines.push({ type: 'longDuration', coins: 8 });
  }

  const priorPaces = priorSessions
    .map((s) => s.metrics?.paceSecPer100m)
    .filter((p) => p != null && p > 0);
  if (pace != null && priorPaces.length > 0) {
    const avgPace = priorPaces.reduce((a, b) => a + b, 0) / priorPaces.length;
    if (pace < avgPace) {
      const improvement = Math.min(20, Math.floor((avgPace - pace) / 3));
      if (improvement > 0) {
        coins += improvement;
        lines.push({
          type: 'paceImprovement',
          coins: improvement,
          avgPaceSec: avgPace,
          paceSec: pace,
        });
      }
    }
  }

  return { sessionCoins: Math.max(5, coins), lines };
};

/** Coins for a single swim session based on effort and performance. */
export const calculateSessionCoins = (session, priorSessions = []) =>
  calculateSessionCoinBreakdown(session, priorSessions).sessionCoins;

/** Full coin breakdown when saving a session. */
export const calculateUploadCoins = ({
  session,
  sessionsBefore = [],
  newMedals = [],
  monthlyUpgrade = null,
  spentCoinClaims = [],
}) => {
  if (findSpentCoinClaim(spentCoinClaims, session)) {
    return {
      sessionCoins: 0,
      medalCoins: 0,
      monthlyCoins: 0,
      total: 0,
      sessionLines: [],
      bonusLines: [],
      alreadyClaimed: true,
    };
  }

  const { sessionCoins, lines: sessionLines } = calculateSessionCoinBreakdown(session, sessionsBefore);

  const bonusLines = [];
  let medalCoins = 0;
  for (const medal of newMedals) {
    const amount = medalTierCoins(medal.tier);
    medalCoins += amount;
    bonusLines.push({ type: 'medal', coins: amount, medalId: medal.id, tier: medal.tier });
  }

  let monthlyCoins = 0;
  if (monthlyUpgrade?.tier) {
    monthlyCoins = monthlyTierCoinDelta(monthlyUpgrade.fromTier, monthlyUpgrade.tier);
    if (monthlyCoins > 0) {
      bonusLines.push({
        type: 'monthly',
        coins: monthlyCoins,
        fromTier: monthlyUpgrade.fromTier,
        toTier: monthlyUpgrade.tier,
      });
    }
  }

  return {
    sessionCoins,
    medalCoins,
    monthlyCoins,
    total: sessionCoins + medalCoins + monthlyCoins,
    sessionLines,
    bonusLines,
    alreadyClaimed: false,
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
