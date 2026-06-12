import { createContext, useContext } from 'react';
import { useSwimStorage } from '../hooks/useSwimStorage';
import { useSwimCheats } from '../hooks/useSwimCheats';

const SwimContext = createContext(null);

export function SwimProvider({ children }) {
  const swim = useSwimStorage();
  const cheatControls = useSwimCheats();
  return (
    <SwimContext.Provider value={{ ...swim, ...cheatControls }}>
      {children}
    </SwimContext.Provider>
  );
}

export function useSwim() {
  const ctx = useContext(SwimContext);
  if (!ctx) throw new Error('useSwim must be used within SwimProvider');
  return ctx;
}
