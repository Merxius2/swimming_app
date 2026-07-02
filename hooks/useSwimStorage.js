import { useState, useEffect, useCallback, useRef } from 'react';
import { DEFAULT_SWIM_DATA } from '../lib/swimConstants';
import { loadSwimData, saveSwimData, createSessionId } from '../lib/swimStorage';
import { createCoinClaim, sessionTotalCoins } from '../lib/swimCoinClaims';
import { migrateSessionCoins, migrateCoinBonuses, reconcileTotalCoins } from '../lib/swimCoins';
import { normalizeWheelSpins, getWheelSpinDayKey, recordPaidSpin } from '../lib/swimWheelSpins';
import {
  purchaseStoreItemUpdate,
  purchaseConsumableStoreItemUpdate,
  isConsumableStoreItem,
  CHALLENGE_REROLL_STORE_ITEM_ID,
  normalizeStoreUnlocks,
  sanitizeProfileCosmetics,
  migrateCoinsSpent,
} from '../lib/swimCoinStore';
import {
  createMonthlyChallengeReroll,
  canRerollMonthlyChallenge,
  normalizeMonthRerollEntry,
  normalizeMonthlyChallengeRerolls,
  hasRerollAvailability,
} from '../lib/swimMonthlyChallenges';

export function useSwimStorage(debounceDelay = 500) {
  const [data, setData] = useState(DEFAULT_SWIM_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    setData(loadSwimData());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return undefined;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => saveSwimData(data), debounceDelay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, isLoading, debounceDelay]);

  const updateProfile = useCallback((updates) => {
    setData((prev) => {
      const next = {
        ...prev,
        profile: sanitizeProfileCosmetics(
          { ...prev.profile, ...updates },
          prev.storeUnlocks
        ),
      };
      saveSwimData(next);
      return next;
    });
  }, []);

  const addSession = useCallback(({ date, metrics, coinsEarned = 0, coinBonus = 0 }) => {
    const entry = {
      id: createSessionId(),
      createdAt: new Date().toISOString(),
      date,
      metrics,
      coinsEarned,
      coinBonus,
    };
    setData((prev) => ({
      ...prev,
      totalCoins: (prev.totalCoins || 0) + coinsEarned + coinBonus,
      sessions: [...prev.sessions, entry].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      ),
    }));
    return entry;
  }, []);

  const removeSession = useCallback((id) => {
    setData((prev) => {
      const session = prev.sessions.find((s) => s.id === id);
      if (!session) return prev;

      const coinsRemoved = sessionTotalCoins(session);
      const spentCoinClaims = [...(prev.spentCoinClaims || [])];

      if (coinsRemoved > 0) {
        spentCoinClaims.push(createCoinClaim(session));
      }

      return {
        ...prev,
        totalCoins: Math.max(0, (prev.totalCoins || 0) - coinsRemoved),
        spentCoinClaims,
        sessions: prev.sessions.filter((s) => s.id !== id),
      };
    });
  }, []);

  const replaceData = useCallback((nextData) => {
    const sessions = migrateCoinBonuses(
      migrateSessionCoins(Array.isArray(nextData.sessions) ? nextData.sessions : [])
    );
    const storeUnlocks = normalizeStoreUnlocks(
      nextData.storeUnlocks,
      nextData.purchasedThemes
    );
    const coinsSpent = migrateCoinsSpent(nextData.coinsSpent, storeUnlocks);
    setData({
      profile: sanitizeProfileCosmetics(
        { ...DEFAULT_SWIM_DATA.profile, ...nextData.profile },
        storeUnlocks
      ),
      totalCoins: reconcileTotalCoins(sessions, nextData.totalCoins, coinsSpent),
      coinsSpent,
      sessions,
      spentCoinClaims: Array.isArray(nextData.spentCoinClaims) ? nextData.spentCoinClaims : [],
      wheelSpins: normalizeWheelSpins(nextData.wheelSpins, getWheelSpinDayKey()),
      storeUnlocks,
      monthlyChallengeRerolls: normalizeMonthlyChallengeRerolls(nextData.monthlyChallengeRerolls),
      challengeRerollCredits: Math.max(0, Number(nextData.challengeRerollCredits) || 0),
    });
  }, []);

  const rerollMonthlyChallenge = useCallback((monthKey, tierIndex) => {
    let success = false;
    setData((prev) => {
      const credits = prev.challengeRerollCredits || 0;
      if (!canRerollMonthlyChallenge(prev.sessions, monthKey, tierIndex, prev.monthlyChallengeRerolls, credits)) {
        return prev;
      }
      const override = createMonthlyChallengeReroll(
        prev.sessions,
        monthKey,
        tierIndex,
        prev.monthlyChallengeRerolls
      );
      if (!override) return prev;

      const monthEntry = normalizeMonthRerollEntry(prev.monthlyChallengeRerolls?.[monthKey]);
      const useFree = !monthEntry.freeUsed;
      if (!useFree && credits < 1) return prev;

      success = true;
      const next = {
        ...prev,
        challengeRerollCredits: useFree ? credits : credits - 1,
        monthlyChallengeRerolls: {
          ...(prev.monthlyChallengeRerolls || {}),
          [monthKey]: {
            overrides: { ...monthEntry.overrides, [tierIndex]: override.type },
            freeUsed: monthEntry.freeUsed || useFree,
          },
        },
      };
      saveSwimData(next);
      return next;
    });
    return success;
  }, []);

  const clearAll = useCallback(() => {
    setData({ ...DEFAULT_SWIM_DATA, sessions: [], spentCoinClaims: [], coinsSpent: 0 });
  }, []);

  const adjustCoins = useCallback((delta) => {
    setData((prev) => {
      const next = {
        ...prev,
        totalCoins: Math.max(0, (prev.totalCoins || 0) + delta),
        coinsSpent: delta < 0
          ? (prev.coinsSpent || 0) + Math.abs(delta)
          : (prev.coinsSpent || 0),
      };
      if (delta < 0) saveSwimData(next);
      return next;
    });
  }, []);

  const recordWheelPaidSpin = useCallback(() => {
    const today = getWheelSpinDayKey();
    setData((prev) => ({
      ...prev,
      wheelSpins: recordPaidSpin(prev.wheelSpins, today),
    }));
  }, []);

  const purchaseStoreItem = useCallback((itemId) => {
    let purchased = false;
    setData((prev) => {
      if (isConsumableStoreItem(itemId)) {
        const update = purchaseConsumableStoreItemUpdate(
          itemId,
          prev.totalCoins || 0,
          prev.coinsSpent || 0
        );
        if (!update) return prev;
        purchased = true;
        const next = {
          ...prev,
          totalCoins: update.totalCoins,
          coinsSpent: update.coinsSpent,
          challengeRerollCredits: itemId === CHALLENGE_REROLL_STORE_ITEM_ID
            ? (prev.challengeRerollCredits || 0) + 1
            : (prev.challengeRerollCredits || 0),
        };
        saveSwimData(next);
        return next;
      }

      const update = purchaseStoreItemUpdate(
        itemId,
        prev.storeUnlocks,
        prev.totalCoins || 0,
        prev.coinsSpent || 0
      );
      if (!update) return prev;
      purchased = true;
      const next = {
        ...prev,
        storeUnlocks: update.storeUnlocks,
        totalCoins: update.totalCoins,
        coinsSpent: update.coinsSpent,
      };
      saveSwimData(next);
      return next;
    });
    return purchased;
  }, []);

  return {
    data,
    isLoading,
    profile: data.profile,
    sessions: data.sessions,
    totalCoins: data.totalCoins || 0,
    coinsSpent: data.coinsSpent || 0,
    spentCoinClaims: data.spentCoinClaims || [],
    wheelSpins: data.wheelSpins,
    storeUnlocks: data.storeUnlocks || [],
    monthlyChallengeRerolls: data.monthlyChallengeRerolls || {},
    challengeRerollCredits: data.challengeRerollCredits || 0,
    updateProfile,
    addSession,
    removeSession,
    replaceData,
    clearAll,
    adjustCoins,
    recordWheelPaidSpin,
    purchaseStoreItem,
    rerollMonthlyChallenge,
  };
}
