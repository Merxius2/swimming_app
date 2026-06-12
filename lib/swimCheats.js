export const SWIM_CHEATS_KEY = 'AUDIT_SWIM_CHEATS';

export const DEFAULT_SWIM_CHEATS = {
  allMedalsUnlocked: false,
};

export const loadSwimCheats = () => {
  if (typeof window === 'undefined') return { ...DEFAULT_SWIM_CHEATS };
  try {
    const raw = localStorage.getItem(SWIM_CHEATS_KEY);
    if (!raw) return { ...DEFAULT_SWIM_CHEATS };
    return { ...DEFAULT_SWIM_CHEATS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SWIM_CHEATS };
  }
};

export const saveSwimCheats = (cheats) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SWIM_CHEATS_KEY, JSON.stringify(cheats));
  } catch {
    /* ignore quota errors */
  }
};

export const clearSwimCheats = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SWIM_CHEATS_KEY);
  } catch {
    /* ignore quota errors */
  }
};
