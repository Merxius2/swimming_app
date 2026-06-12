import { useState, useEffect, useCallback, useRef } from 'react';
import { DEFAULT_SWIM_DATA } from '../lib/swimConstants';
import { loadSwimData, saveSwimData, createSessionId } from '../lib/swimStorage';

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

  const addSession = useCallback((session) => {
    const entry = {
      id: createSessionId(),
      createdAt: new Date().toISOString(),
      ...session,
    };
    setData((prev) => ({
      ...prev,
      sessions: [...prev.sessions, entry].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      ),
    }));
    return entry;
  }, []);

  const removeSession = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((s) => s.id !== id),
    }));
  }, []);

  const replaceData = useCallback((nextData) => {
    setData({
      profile: { ...DEFAULT_SWIM_DATA.profile, ...nextData.profile },
      sessions: Array.isArray(nextData.sessions) ? nextData.sessions : [],
    });
  }, []);

  const clearAll = useCallback(() => {
    setData({ ...DEFAULT_SWIM_DATA, sessions: [] });
  }, []);

  return {
    data,
    isLoading,
    profile: data.profile,
    sessions: data.sessions,
    updateProfile,
    addSession,
    removeSession,
    replaceData,
    clearAll,
  };
}
