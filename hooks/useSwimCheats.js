import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_SWIM_CHEATS, loadSwimCheats, saveSwimCheats } from '../lib/swimCheats';

export function useSwimCheats() {
  const [cheats, setCheatsState] = useState(DEFAULT_SWIM_CHEATS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCheatsState(loadSwimCheats());
    setReady(true);
  }, []);

  const setCheats = useCallback((updates) => {
    setCheatsState((prev) => {
      const next = { ...prev, ...updates };
      saveSwimCheats(next);
      return next;
    });
  }, []);

  const setAllMedalsUnlocked = useCallback((value) => {
    setCheats({ allMedalsUnlocked: Boolean(value) });
  }, [setCheats]);

  return {
    cheats,
    cheatsReady: ready,
    setCheats,
    setAllMedalsUnlocked,
  };
}
