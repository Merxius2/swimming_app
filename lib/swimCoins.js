/**
 * Swim coin rewards — earned from sessions and medals.
 * Stored in swim data; usage TBD.
 */

import { findSpentCoinClaim, sessionTotalCoins } from './swimCoinClaims.js';
import { getNewlyEarnedMedals } from './swimMedals.js';
import { evaluateMonthlyChallenges, getMonthlyTierUpgrade, tierRank } from './swimMonthlyChallenges.js';
import { getMascotGameplay } from './mascotConstants.js';

const TIER_COINS = { bronze: 25, silver: 60, gold: 150 };
const MONTHLY_TIER_COINS = { bronze: 30, silver: 75, gold: 180 };

export const medalTierCoins = (tier) => TIER_COINS[tier] || 0;

export const monthlyTierCoins = (tier) => (tier ? MONTHLY_TIER_COINS[tier] || 0 : 0);

export const monthlyTierCoinDelta = (fromTier, toTier) =>
  monthlyTierCoins(toTier) - monthlyTierCoins(fromTier);

/** Detailed session coin breakdown with line items for UI. */
export const calculateSessionCoinBreakdown = (session, priorSessions = [], { mascotId = null } = {}) => {
  const gameplay = mascotId ? getMascotGameplay(mascotId) : null;
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

        // Fins pushes harder — and rewards real improvement handsomely.
        if (gameplay?.doubleImprovementBonus) {
          const finsBonus = Math.max(5, improvement);
          coins += finsBonus;
          lines.push({ type: 'finsBonus', coins: finsBonus });
        }
      }
    } else if (gameplay?.sessionPenalty && pace > avgPace) {
      // Fins docks coins when you swim clearly below your own average.
      const slip = Math.min(15, Math.floor((pace - avgPace) / 4));
      if (slip > 0) {
        coins -= slip;
        lines.push({
          type: 'finsPenalty',
          coins: -slip,
          avgPaceSec: avgPace,
          paceSec: pace,
        });
      }
    }
  }

  // Flip only hands out half the coins — but you can never lose any.
  if (gameplay && gameplay.coinMultiplier !== 1 && coins > 0) {
    const reduced = Math.ceil(coins * gameplay.coinMultiplier);
    if (reduced !== coins) {
      lines.push({ type: 'coachShare', coins: reduced - coins });
      coins = reduced;
    }
  }

  const minCoins = gameplay ? gameplay.minSessionCoins : 5;
  const sessionCoins = minCoins != null ? Math.max(minCoins, coins) : coins;

  return { sessionCoins, lines };
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
  mascotId = null,
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

  const { sessionCoins, lines: sessionLines } = calculateSessionCoinBreakdown(session, sessionsBefore, { mascotId });

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

/**
 * Coach penalty for finishing the previous month below the coach's required
 * tier (Flo: silver, Fins: gold). A month is only settled once, and only if
 * it actually had sessions.
 */
export const getMonthlyShortfallPenalty = ({
  sessions = [],
  uploadMonthKey,
  mascotId = null,
  rerolls = {},
  settledMonths = {},
}) => {
  if (!mascotId || !uploadMonthKey) return null;
  const gameplay = getMascotGameplay(mascotId);
  if (!gameplay.requiredMonthlyTier || !gameplay.monthlyPenaltyCoins) return null;

  const [year, month] = uploadMonthKey.split('-').map(Number);
  if (!year || !month) return null;
  const prev = new Date(year, month - 2, 1);
  const prevMonthKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;

  if (settledMonths?.[prevMonthKey]) return null;
  if (!sessions.some((s) => s.date.startsWith(prevMonthKey))) return null;

  const state = evaluateMonthlyChallenges(
    sessions,
    prevMonthKey,
    rerolls,
    gameplay.challengeIntensity
  );
  if (tierRank(state.tier) >= tierRank(gameplay.requiredMonthlyTier)) return null;

  return {
    monthKey: prevMonthKey,
    coins: gameplay.monthlyPenaltyCoins,
    achievedTier: state.tier,
    requiredTier: gameplay.requiredMonthlyTier,
    mascotId,
  };
};

/** Recompute wallet total from stored session coin fields (session + medal bonuses). */
export const sumSessionCoins = (sessions) =>
  (sessions || []).reduce((sum, s) => sum + sessionTotalCoins(s), 0);

/** Backfill coinsEarned on legacy sessions (one-time style migration). */
export const migrateSessionCoins = (sessions) => {
  const sorted = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
  return sorted.map((session, i) => {
    if (session.coinsEarned != null) return session;
    const prior = sorted.slice(0, i);
    return { ...session, coinsEarned: calculateSessionCoins(session, prior) };
  });
};

/**
 * Backfill coinBonus on sessions saved before medal/monthly bonuses were stored per session.
 * Replays upload order to assign bonuses that were only reflected in totalCoins.
 */
export const migrateCoinBonuses = (sessions) => {
  const sorted = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
  const prior = [];

  return sorted.map((session) => {
    let next = { ...session };

    if (next.coinsEarned == null) {
      next.coinsEarned = calculateSessionCoins(next, prior);
    }

    if (next.coinBonus == null) {
      const allWithNew = [...prior, next];
      const earnedNow = getNewlyEarnedMedals(prior, allWithNew, {});
      const monthKey = next.date?.slice(0, 7);
      const monthUpgrade = monthKey
        ? getMonthlyTierUpgrade(prior, allWithNew, monthKey)
        : null;
      const { medalCoins, monthlyCoins } = calculateUploadCoins({
        session: next,
        sessionsBefore: prior,
        newMedals: earnedNow,
        monthlyUpgrade: monthUpgrade,
        spentCoinClaims: [],
      });
      next.coinBonus = medalCoins + monthlyCoins;
    }

    prior.push(next);
    return next;
  });
};

/**
 * Keep wallet in sync with session earnings while preserving store/wheel spending.
 * `coinsSpent` tracks cumulative deductions that would otherwise be restored by
 * Math.max(stored, fromSessions) on reload.
 */
export const reconcileTotalCoins = (sessions, storedTotal, coinsSpent = 0) => {
  const fromSessions = sumSessionCoins(sessions);
  let stored = typeof storedTotal === 'number' && !Number.isNaN(storedTotal) ? storedTotal : 0;
  const spent = Math.max(0, Number(coinsSpent) || 0);
  const sessionBalance = Math.max(0, fromSessions - spent);

  if (spent > 0 && stored >= fromSessions && stored > sessionBalance) {
    // Legacy reloads reconciled spent coins back up to the session total.
    stored = sessionBalance;
  }

  const earned = Math.max(fromSessions, stored + spent);
  return Math.max(0, earned - spent);
};

/** @internal */
export const __testing = { TIER_COINS, MONTHLY_TIER_COINS };
