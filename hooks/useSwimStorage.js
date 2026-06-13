import { useState, useEffect, useCallback, useRef } from 'react';
import { DEFAULT_SWIM_DATA } from '../lib/swimConstants';
import { loadSwimData, saveSwimData, createSessionId } from '../lib/swimStorage';
import { createCoinClaim, sessionTotalCoins } from '../lib/swimCoinClaims';
import { migrateSessionCoins, migrateCoinBonuses, reconcileTotalCoins } from '../lib/swimCoins';
import { normalizeWheelSpins, getWheelSpinDayKey, recordPaidSpin } from '../lib/swimWheelSpins';
import {
  purchaseStoreItemUpdate,
  normalizeStoreUnlocks,
  sanitizeProfileCosmetics,
} from '../lib/swimCoinStore';

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
      profile: sanitizeProfileCosmetics(
        { ...prev.profile, ...updates },
        prev.storeUnlocks
      ),
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
    const storeUnlocks = normalizeStoreUnlocks(
      nextData.storeUnlocks,
      nextData.purchasedThemes
    );
    setData({
      profile: sanitizeProfileCosmetics(
        { ...DEFAULT_SWIM_DATA.profile, ...nextData.profile },
        storeUnlocks
      ),
      totalCoins: reconcileTotalCoins(sessions, nextData.totalCoins),
      sessions,
      spentCoinClaims: Array.isArray(nextData.spentCoinClaims) ? nextData.spentCoinClaims : [],
      wheelSpins: normalizeWheelSpins(nextData.wheelSpins, getWheelSpinDayKey()),
      storeUnlocks,
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

  const purchaseStoreItem = useCallback((itemId) => {
    let purchased = false;
    setData((prev) => {
      const update = purchaseStoreItemUpdate(
        itemId,
        prev.storeUnlocks,
        prev.totalCoins || 0
      );
      if (!update) return prev;
      purchased = true;
      const next = {
        ...prev,
        storeUnlocks: update.storeUnlocks,
        totalCoins: update.totalCoins,
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
    spentCoinClaims: data.spentCoinClaims || [],
    wheelSpins: data.wheelSpins,
    storeUnlocks: data.storeUnlocks || [],
    updateProfile,
    addSession,
    removeSession,
    replaceData,
    clearAll,
    adjustCoins,
    recordWheelPaidSpin,
    purchaseStoreItem,
  };
}
