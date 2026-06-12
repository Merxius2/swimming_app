/**
 * AmbientBackground
 * Fixed-position mesh-gradient blobs that sit behind all content.
 * Liquid-glass surfaces above pick up tint from this layer through backdrop-filter.
 * Rendered once at the app root.
 */
import { useLanguage, useTheme } from '../context/UserPreferencesContext';

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

export default function AmbientBackground() {
  const { language } = useLanguage();
  const { theme } = useTheme();

  let blobs = DEFAULT_BLOBS;
  if (language === 'mu') {
    blobs = MURICA_BLOBS;
  } else if (theme === 'gen-z' || theme === 'classic') {
    blobs = [];
  }

  return (
    <div aria-hidden className="pointer-events-none fixed -inset-x-[20vw] -inset-y-[20vh] -z-10 overflow-hidden">
      {language === 'mu' && (
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, #991B1B 0%, #DC2626 45%, #7F1D1D 100%)' }}
        />
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
    </div>
  );
}
