/**
 * AmbientBackground
 * Fixed-position mesh-gradient blobs that sit behind all content.
 * Liquid-glass surfaces above pick up tint from this layer through backdrop-filter.
 * Portaled to document.body so iOS Safari keeps the layer visible behind the page.
 */
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
  { left: '6%', size: 28, delay: '0s', duration: '9s' },
  { left: '14%', size: 18, delay: '2.4s', duration: '11s' },
  { left: '24%', size: 34, delay: '0.8s', duration: '10.5s' },
  { left: '33%', size: 22, delay: '3.6s', duration: '12s' },
  { left: '42%', size: 16, delay: '1.2s', duration: '8.5s' },
  { left: '51%', size: 30, delay: '4.2s', duration: '11.5s' },
  { left: '60%', size: 20, delay: '0.3s', duration: '9.8s' },
  { left: '69%', size: 26, delay: '2.8s', duration: '10.2s' },
  { left: '78%', size: 14, delay: '5s', duration: '8s' },
  { left: '87%', size: 32, delay: '1.6s', duration: '12.5s' },
  { left: '93%', size: 18, delay: '3.2s', duration: '9.2s' },
  { left: '48%', size: 24, delay: '6s', duration: '13s' },
];

function AmbientLayer({ language, theme, ambientPreset }) {
  let blobs = DEFAULT_BLOBS;
  let gradientClass = null;
  let driftBlobs = false;
  let showBubbles = false;

  if (language === 'mu') {
    blobs = MURICA_BLOBS;
  } else if (ambientPreset) {
    blobs = ambientPreset.blobs;
    gradientClass = ambientPreset.gradientClass;
    driftBlobs = ambientPreset.driftBlobs;
    showBubbles = ambientPreset.bubbles;
  } else if (theme !== 'liquid-os') {
    blobs = [];
  }

  return (
    <>
      <div aria-hidden className="ambient-layer pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {language === 'mu' && (
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(160deg, #991B1B 0%, #DC2626 45%, #7F1D1D 100%)' }}
          />
        )}
        {gradientClass && <div className={`ambient-gradient absolute inset-0 ${gradientClass}`} />}
        {blobs.map((blob, index) => (
          <div
            key={index}
            className={`ambient-blob absolute${driftBlobs ? ' ambient-blob-drift' : ''}`}
            style={{
              width: blob.width,
              height: blob.height,
              left: blob.left,
              right: blob.right,
              top: blob.top,
              bottom: blob.bottom,
              animationDelay: driftBlobs ? `${index * -4.5}s` : undefined,
            }}
          >
            <div
              className="ambient-blob-glow absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${blob.color} 0%, transparent 65%)`,
                opacity: blob.opacity,
              }}
            />
          </div>
        ))}
      </div>
      {showBubbles && (
        <div aria-hidden className="ambient-bubbles pointer-events-none fixed inset-0 z-[1] overflow-hidden">
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
    </>
  );
}

export default function AmbientBackground() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const { profile, storeUnlocks } = useSwim();
  const [mounted, setMounted] = useState(false);

  const activeAmbient = profile?.activeAmbient;
  const ambientOwned = activeAmbient && isStoreItemOwned(activeAmbient, storeUnlocks);
  const ambientPreset = ambientOwned ? getAmbientPreset(activeAmbient) : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('ambient-active', Boolean(ambientPreset));
    return () => document.documentElement.classList.remove('ambient-active');
  }, [ambientPreset]);

  if (!mounted) return null;

  return createPortal(
    <AmbientLayer language={language} theme={theme} ambientPreset={ambientPreset} />,
    document.body
  );
}
