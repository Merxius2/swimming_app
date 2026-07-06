import { useState, useEffect, useCallback, useRef } from 'react';
import { DEFAULT_SWIM_DATA } from '../lib/swimConstants';
import { loadSwimData, saveSwimData, createSessionId } from '../lib/swimStorage';
import { createCoinClaim, sessionTotalCoins } from '../lib/swimCoinClaims';
import { migrateSessionCoins, migrateCoinBonuses, reconcileTotalCoins } from '../lib/swimCoins';
import { normalizeWheelSpins, getWheelSpinDayKey, recordPaidSpin } from '../lib/swimWheelSpins';
import {
  purchaseStoreItemUpdate,
  isConsumableStoreItem,
  normalizeStoreUnlocks,
  sanitizeProfileCosmetics,
  migrateCoinsSpent,
  normalizeBonusWheelSpinCredits,
  stripBonusSpinUnlock,
} from '../lib/swimCoinStore';
import { normalizeMonthlyChallengeRerolls } from '../lib/swimMonthlyChallenges';
import {
  applyMonthlyChallengeReroll,
  applyConsumableStorePurchase,
} from '../lib/swimChallengeRerollStorage';

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
      excludeFromStats: false,
    };
    setData((prev) => ({
      ...prev,
      // coinsEarned can be negative when a demanding coach docks coins
      totalCoins: Math.max(0, (prev.totalCoins || 0) + coinsEarned + coinBonus),
      sessions: [...prev.sessions, entry].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      ),
    }));
    return entry;
  }, []);

  /**
   * Deduct a coach's monthly shortfall penalty once per month.
   * Goes through coinsSpent so the deduction survives wallet reconciliation.
   */
  const applyMonthlySettlement = useCallback(({ monthKey, coins, mascotId }) => {
    setData((prev) => {
      if (!monthKey || prev.monthlySettlements?.[monthKey]) return prev;
      const deduction = Math.min(Math.max(0, coins), prev.totalCoins || 0);
      const next = {
        ...prev,
        totalCoins: Math.max(0, (prev.totalCoins || 0) - deduction),
        coinsSpent: (prev.coinsSpent || 0) + deduction,
        monthlySettlements: {
          ...(prev.monthlySettlements || {}),
          [monthKey]: {
            coins: deduction,
            mascotId: mascotId || null,
            appliedAt: new Date().toISOString(),
          },
        },
      };
      saveSwimData(next);
      return next;
    });
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

  const updateSession = useCallback((id, updates) => {
    setData((prev) => {
      const idx = prev.sessions.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const sessions = [...prev.sessions];
      sessions[idx] = { ...sessions[idx], ...updates };
      return { ...prev, sessions };
    });
  }, []);

  const replaceData = useCallback((nextData) => {
    const sessions = migrateCoinBonuses(
      migrateSessionCoins(Array.isArray(nextData.sessions) ? nextData.sessions : [])
    );
    const rawStoreUnlocks = normalizeStoreUnlocks(
      nextData.storeUnlocks,
      nextData.purchasedThemes
    );
    const bonusWheelSpinCredits = normalizeBonusWheelSpinCredits(
      nextData.bonusWheelSpinCredits,
      rawStoreUnlocks
    );
    const storeUnlocks = stripBonusSpinUnlock(rawStoreUnlocks);
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
      bonusWheelSpinCredits,
      monthlySettlements: nextData.monthlySettlements && typeof nextData.monthlySettlements === 'object'
        ? nextData.monthlySettlements
        : {},
    });
  }, []);

  const rerollMonthlyChallenge = useCallback((monthKey, tierIndex) => {
    let success = false;
    setData((prev) => {
      const result = applyMonthlyChallengeReroll(prev, monthKey, tierIndex);
      success = result.success;
      if (!result.success) return prev;
      saveSwimData(result.data);
      return result.data;
    });
    return success;
  }, []);

  const clearAll = useCallback(() => {
    setData({ ...DEFAULT_SWIM_DATA, sessions: [], spentCoinClaims: [], coinsSpent: 0, monthlySettlements: {} });
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
        const result = applyConsumableStorePurchase(prev, itemId);
        if (!result.purchased) return prev;
        purchased = true;
        saveSwimData(result.data);
        return result.data;
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
    bonusWheelSpinCredits: data.bonusWheelSpinCredits || 0,
    monthlySettlements: data.monthlySettlements || {},
    updateProfile,
    addSession,
    applyMonthlySettlement,
    removeSession,
    updateSession,
    replaceData,
    clearAll,
    adjustCoins,
    recordWheelPaidSpin,
    purchaseStoreItem,
    rerollMonthlyChallenge,
  };
}
