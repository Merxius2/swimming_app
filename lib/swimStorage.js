import { SWIM_STORAGE_KEY, DEFAULT_SWIM_DATA } from './swimConstants.js';

export const loadSwimData = () => {
  if (typeof window === 'undefined') return DEFAULT_SWIM_DATA;
  try {
    const raw = localStorage.getItem(SWIM_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SWIM_DATA, sessions: [] };
    const parsed = JSON.parse(raw);
    return {
      profile: { ...DEFAULT_SWIM_DATA.profile, ...parsed.profile },
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    };
  } catch {
    return { ...DEFAULT_SWIM_DATA, sessions: [] };
  }
};

export const saveSwimData = (data) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SWIM_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving swim data', error);
  }
};

export const clearSwimData = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SWIM_STORAGE_KEY);
};

export const createSessionId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};
