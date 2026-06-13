export const AMBIENT_PRESETS = {
  'ambient:neon-lagoon': {
    gradient: 'linear-gradient(165deg, #020617 0%, #0c1445 40%, #1a0533 100%)',
    blobs: [
      { width: '58vw', height: '58vw', left: '-12vw', top: '-12vh', color: '#00E5FF', opacity: 0.55 },
      { width: '48vw', height: '48vw', right: '-8vw', top: '5vh', color: '#FF00AA', opacity: 0.45 },
      { width: '62vw', height: '62vw', left: '10vw', bottom: '-20vh', color: '#7C3AED', opacity: 0.4 },
      { width: '30vw', height: '30vw', right: '15vw', bottom: '10vh', color: '#22D3EE', opacity: 0.35 },
    ],
    bubbles: false,
  },
  'ambient:sunset-lap': {
    gradient: 'linear-gradient(160deg, #431407 0%, #9a3412 35%, #7c2d12 70%, #1c1917 100%)',
    blobs: [
      { width: '65vw', height: '65vw', left: '-10vw', top: '-15vh', color: '#FB923C', opacity: 0.65 },
      { width: '50vw', height: '50vw', right: '-12vw', top: '10vh', color: '#F472B6', opacity: 0.45 },
      { width: '55vw', height: '55vw', left: '5vw', bottom: '-18vh', color: '#FBBF24', opacity: 0.5 },
      { width: '38vw', height: '38vw', right: '8vw', bottom: '8vh', color: '#EF4444', opacity: 0.35 },
    ],
    bubbles: false,
  },
  'ambient:bubble-trail': {
    gradient: null,
    blobs: [
      { width: '45vw', height: '45vw', left: '-5vw', top: '-8vh', color: '#BAE6FD', opacity: 0.45 },
      { width: '40vw', height: '40vw', right: '-5vw', bottom: '-10vh', color: '#A5F3FC', opacity: 0.4 },
    ],
    bubbles: true,
  },
};

export function getAmbientPreset(ambientId) {
  return AMBIENT_PRESETS[ambientId] || null;
}
