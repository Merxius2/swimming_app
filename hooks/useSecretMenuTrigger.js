import { useCallback, useRef } from 'react';
import { useSecretSettings } from '../context/FeatureContext';

/**
 * Opens secret settings after `clicks` taps within `windowMs`.
 */
export function useSecretMenuTrigger(clicks = 3, windowMs = 2500) {
  const { openSecretSettings } = useSecretSettings();
  const timestampsRef = useRef([]);

  return useCallback(() => {
    const now = Date.now();
    timestampsRef.current = timestampsRef.current.filter((t) => now - t < windowMs);
    timestampsRef.current.push(now);
    if (timestampsRef.current.length >= clicks) {
      timestampsRef.current = [];
      openSecretSettings();
    }
  }, [clicks, windowMs, openSecretSettings]);
}
