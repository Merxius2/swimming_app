/**
 * AmbientBackground
 * Fixed-position mesh-gradient blobs that sit behind all content.
 * Liquid-glass surfaces above pick up tint from this layer through backdrop-filter.
 * Rendered once at the app root.
 */
import { useEffect } from 'react';
import { useLanguage, useTheme } from '../context/UserPreferencesContext';
import { useSwim } from '../context/SwimContext';
import { isStoreItemOwned } from '../lib/swimCoinStore';
import { getAmbientPreset } from '../lib/storeAmbients';

const DEFAULT_BLOBS = [
  { width: '60vw', height: '60vw', left: '-8vw', top: '-10vh', color: '#B8C4FF', opacity: 0.85 },
  { width: '50vw', height: '50vw', right: '-10vw', top: '8vh', color: '#FFC6BC', opacity: 0.70 },
  { width: '70vw', height: '70vw', left: '5vw', bottom: '-25vh', color: '#C8F0DB', opacity: 0.80 },
  { width: '35vw', height: '35vw', right: '10vw', bottom: '5vh', color: '#E4D6FF', opacity: 0.70 },
];

const MURICA_BLOBS = [
  { width: '60vw', height: '60vw', left: '-8vw', top: '-10vh', color: '#EF4444', opacity: 0.90 },
  { width: '50vw', height: '50vw', right: '-10vw', top: '8vh', color: '#DC2626', opacity: 0.85 },
  { width: '70vw', height: '70vw', left: '5vw', bottom: '-25vh', color: '#B91C1C', opacity: 0.90 },
  { width: '35vw', height: '35vw', right: '10vw', bottom: '5vh', color: '#F87171', opacity: 0.80 },
];

const BUBBLE_POSITIONS = [
  { left: '8%', size: 18, delay: '0s', duration: '9s' },
  { left: '22%', size: 12, delay: '1.5s', duration: '11s' },
  { left: '38%', size: 22, delay: '0.8s', duration: '10s' },
  { left: '55%', size: 14, delay: '2.2s', duration: '12s' },
  { left: '71%', size: 20, delay: '0.4s', duration: '9.5s' },
  { left: '86%', size: 10, delay: '3s', duration: '8s' },
];

export default function AmbientBackground() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const { profile, storeUnlocks } = useSwim();

  const activeAmbient = profile?.activeAmbient;
  const ambientOwned = activeAmbient && isStoreItemOwned(activeAmbient, storeUnlocks);
  const ambientPreset = ambientOwned ? getAmbientPreset(activeAmbient) : null;

  let blobs = DEFAULT_BLOBS;
  let baseGradient = null;
  let showBubbles = false;

  if (language === 'mu') {
    blobs = MURICA_BLOBS;
  } else if (ambientPreset) {
    blobs = ambientPreset.blobs;
    baseGradient = ambientPreset.gradient;
    showBubbles = ambientPreset.bubbles;
  } else if (theme !== 'liquid-os') {
    blobs = [];
  }

  useEffect(() => {
    document.documentElement.classList.toggle('ambient-active', Boolean(ambientPreset));
    return () => document.documentElement.classList.remove('ambient-active');
  }, [ambientPreset]);

  return (
    <div aria-hidden className="pointer-events-none fixed -inset-x-[20vw] -inset-y-[20vh] -z-10 overflow-hidden">
      {language === 'mu' && (
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, #991B1B 0%, #DC2626 45%, #7F1D1D 100%)' }}
        />
      )}
      {baseGradient && (
        <div className="absolute inset-0" style={{ background: baseGradient }} />
      )}
      {blobs.map((blob, index) => (
        <div
          key={index}
          className="absolute rounded-full"
          style={{
            width: blob.width,
            height: blob.height,
            left: blob.left,
            right: blob.right,
            top: blob.top,
            bottom: blob.bottom,
            background: `radial-gradient(circle, ${blob.color} 0%, transparent 65%)`,
            filter: 'blur(80px)',
            opacity: blob.opacity,
          }}
        />
      ))}
      {showBubbles && (
        <div className="ambient-bubbles absolute inset-0">
          {BUBBLE_POSITIONS.map((bubble, index) => (
            <span
              key={index}
              className="ambient-bubble"
              style={{
                left: bubble.left,
                width: bubble.size,
                height: bubble.size,
                animationDelay: bubble.delay,
                animationDuration: bubble.duration,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
