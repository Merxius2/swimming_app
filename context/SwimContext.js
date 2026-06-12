import { createContext, useContext } from 'react';
import { useSwimStorage } from '../hooks/useSwimStorage';

const SwimContext = createContext(null);

export function SwimProvider({ children }) {
  const swim = useSwimStorage();
  return <SwimContext.Provider value={swim}>{children}</SwimContext.Provider>;
}

export function useSwim() {
  const ctx = useContext(SwimContext);
  if (!ctx) throw new Error('useSwim must be used within SwimProvider');
  return ctx;
}
