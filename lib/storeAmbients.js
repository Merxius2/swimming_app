export const AMBIENT_PRESETS = {
  'ambient:neon-lagoon': {
    gradientClass: 'ambient-gradient-neon-lagoon',
    driftBlobs: true,
    blobs: [
      { width: '58vw', height: '58vw', left: '-12vw', top: '-12vh', color: '#00E5FF', opacity: 0.55 },
      { width: '48vw', height: '48vw', right: '-8vw', top: '5vh', color: '#FF00AA', opacity: 0.45 },
      { width: '62vw', height: '62vw', left: '10vw', bottom: '-20vh', color: '#7C3AED', opacity: 0.4 },
      { width: '30vw', height: '30vw', right: '15vw', bottom: '10vh', color: '#22D3EE', opacity: 0.35 },
    ],
    bubbles: false,
  },
  'ambient:sunset-lap': {
    gradientClass: 'ambient-gradient-sunset-lap',
    driftBlobs: true,
    blobs: [
      { width: '65vw', height: '65vw', left: '-10vw', top: '-15vh', color: '#FB923C', opacity: 0.65 },
      { width: '50vw', height: '50vw', right: '-12vw', top: '10vh', color: '#F472B6', opacity: 0.45 },
      { width: '55vw', height: '55vw', left: '5vw', bottom: '-18vh', color: '#FBBF24', opacity: 0.5 },
      { width: '38vw', height: '38vw', right: '8vw', bottom: '8vh', color: '#EF4444', opacity: 0.35 },
    ],
    bubbles: false,
  },
  'ambient:bubble-trail': {
    gradientClass: 'ambient-gradient-bubble-trail',
    driftBlobs: false,
    blobs: [
      { width: '45vw', height: '45vw', left: '-5vw', top: '-8vh', color: '#BAE6FD', opacity: 0.45 },
      { width: '40vw', height: '40vw', right: '-5vw', bottom: '-10vh', color: '#A5F3FC', opacity: 0.4 },
    ],
    bubbles: true,
  },
  'ambient:aurora-lap': {
    gradientClass: 'ambient-gradient-aurora-lap',
    driftBlobs: true,
    blobs: [
      { width: '55vw', height: '55vw', left: '-10vw', top: '-12vh', color: '#34D399', opacity: 0.4 },
      { width: '48vw', height: '48vw', right: '-8vw', top: '8vh', color: '#818CF8', opacity: 0.45 },
      { width: '60vw', height: '60vw', left: '8vw', bottom: '-22vh', color: '#22D3EE', opacity: 0.35 },
      { width: '32vw', height: '32vw', right: '12vw', bottom: '12vh', color: '#A78BFA', opacity: 0.3 },
    ],
    bubbles: false,
  },
  'ambient:deep-current': {
    gradientClass: 'ambient-gradient-deep-current',
    driftBlobs: true,
    blobs: [
      { width: '58vw', height: '58vw', left: '-12vw', top: '-10vh', color: '#0EA5E9', opacity: 0.45 },
      { width: '52vw', height: '52vw', right: '-10vw', top: '12vh', color: '#0369A1', opacity: 0.5 },
      { width: '64vw', height: '64vw', left: '6vw', bottom: '-20vh', color: '#164E63', opacity: 0.55 },
    ],
    bubbles: false,
  },
};

export function getAmbientPreset(ambientId) {
  return AMBIENT_PRESETS[ambientId] || null;
}
