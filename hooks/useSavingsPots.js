/**
 * useSavingsPots Hook
 * Manages savings goal pots (spaarpotjes) for shared or per-person scope
 */

import { useState, useEffect, useRef } from 'react';
import { loadFromCookie, saveToCookie } from '../lib/cookieStorage';
import { getSavingsPotsStorageKey, getSavingsPotsForScope } from '../lib/savingsPots';

const noop = () => {};

export function useSavingsPots(isInitialized = true, scope = 'shared') {
  const enabled = scope != null;
  const [savingsPots, setSavingsPots] = useState([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const saveTimeoutRef = useRef(null);
  const scopeRef = useRef(scope);
  const potsRef = useRef(savingsPots);
  const skipNextSaveRef = useRef(false);

  potsRef.current = savingsPots;

  useEffect(() => {
    if (!enabled) {
      setSavingsPots([]);
      setIsLoading(false);
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    if (isInitialized && scopeRef.current !== scope) {
      const prevKey = getSavingsPotsStorageKey(scopeRef.current);
      const existingData = loadFromCookie('AUDIT_DASHBOARD_DATA') || {};
      saveToCookie('AUDIT_DASHBOARD_DATA', {
        ...existingData,
        [prevKey]: potsRef.current,
      }, 365);
    }

    scopeRef.current = scope;

    const savedData = loadFromCookie('AUDIT_DASHBOARD_DATA') || {};
    skipNextSaveRef.current = true;
    setSavingsPots(getSavingsPotsForScope(savedData, scope));
    setIsLoading(false);
  }, [scope, isInitialized, enabled]);

  useEffect(() => {
    if (!enabled || isLoading || !isInitialized) return;

    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      const key = getSavingsPotsStorageKey(scopeRef.current);
      const existingData = loadFromCookie('AUDIT_DASHBOARD_DATA') || {};
      saveToCookie('AUDIT_DASHBOARD_DATA', {
        ...existingData,
        [key]: potsRef.current,
      }, 365);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [savingsPots, isLoading, isInitialized, enabled]);

  const addPot = enabled
    ? () => {
        setSavingsPots([
          ...savingsPots,
          {
            id: Date.now().toString(),
            name: '',
            goalAmount: '',
            currentAmount: '',
            monthlyContribution: '',
          },
        ]);
      }
    : noop;

  const updatePot = enabled
    ? (id, field, value) => {
        setSavingsPots(savingsPots.map((pot) =>
          pot.id === id ? { ...pot, [field]: value } : pot
        ));
      }
    : noop;

  const removePot = enabled
    ? (id) => {
        setSavingsPots(savingsPots.filter((pot) => pot.id !== id));
      }
    : noop;

  return {
    savingsPots: enabled ? savingsPots : [],
    isLoading: enabled ? isLoading : false,
    addPot,
    updatePot,
    removePot,
  };
}
