import { useState, useEffect, useCallback, useRef } from 'react';
import { DEFAULT_SWIM_DATA } from '../lib/swimConstants';
import { loadSwimData, saveSwimData, createSessionId } from '../lib/swimStorage';
import { createCoinClaim, sessionTotalCoins } from '../lib/swimCoinClaims';
import { migrateSessionCoins, migrateCoinBonuses, reconcileTotalCoins } from '../lib/swimCoins';
import { normalizeWheelSpins, getWheelSpinDayKey, recordPaidSpin } from '../lib/swimWheelSpins';
import { purchaseThemeUpdate, normalizePurchasedThemes } from '../lib/swimCoinStore';

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
    setData((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...updates },
    }));
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
    setData({
      profile: { ...DEFAULT_SWIM_DATA.profile, ...nextData.profile },
      totalCoins: reconcileTotalCoins(sessions, nextData.totalCoins),
      sessions,
      spentCoinClaims: Array.isArray(nextData.spentCoinClaims) ? nextData.spentCoinClaims : [],
      wheelSpins: normalizeWheelSpins(nextData.wheelSpins, getWheelSpinDayKey()),
      purchasedThemes: normalizePurchasedThemes(nextData.purchasedThemes),
    });
  }, []);

  const clearAll = useCallback(() => {
    setData({ ...DEFAULT_SWIM_DATA, sessions: [], spentCoinClaims: [] });
  }, []);

  const adjustCoins = useCallback((delta) => {
    setData((prev) => ({
      ...prev,
      totalCoins: Math.max(0, (prev.totalCoins || 0) + delta),
    }));
  }, []);

  const recordWheelPaidSpin = useCallback(() => {
    const today = getWheelSpinDayKey();
    setData((prev) => ({
      ...prev,
      wheelSpins: recordPaidSpin(prev.wheelSpins, today),
    }));
  }, []);

  const purchaseTheme = useCallback((themeCode) => {
    let purchased = false;
    setData((prev) => {
      const update = purchaseThemeUpdate(
        themeCode,
        prev.purchasedThemes,
        prev.totalCoins || 0
      );
      if (!update) return prev;
      purchased = true;
      return {
        ...prev,
        purchasedThemes: update.purchasedThemes,
        totalCoins: update.totalCoins,
      };
    });
    return purchased;
  }, []);

  return {
    data,
    isLoading,
    profile: data.profile,
    sessions: data.sessions,
    totalCoins: data.totalCoins || 0,
    spentCoinClaims: data.spentCoinClaims || [],
    wheelSpins: data.wheelSpins,
    purchasedThemes: data.purchasedThemes || [],
    updateProfile,
    addSession,
    removeSession,
    replaceData,
    clearAll,
    adjustCoins,
    recordWheelPaidSpin,
    purchaseTheme,
  };
}
