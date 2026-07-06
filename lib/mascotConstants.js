/**
 * Flip & Flo — the swim-coach monkey mascots.
 * Full-body artwork lives in /public/mascot/ with an open-eyes and a
 * closed-eyes (blink) frame per character.
 */
export const MASCOT_CHARACTERS = {
  male: {
    id: 'flip',
    nameKey: 'settings.mascotFlipName',
    descKey: 'settings.mascotFlipDesc',
    images: {
      open: '/mascot/flip-open.png',
      closed: '/mascot/flip-closed.png',
    },
    // natural width / height of the artwork
    aspect: 490 / 900,
  },
  female: {
    id: 'flo',
    nameKey: 'settings.mascotFloName',
    descKey: 'settings.mascotFloDesc',
    images: {
      open: '/mascot/flo-open.png',
      closed: '/mascot/flo-closed.png',
    },
    aspect: 593 / 900,
  },
};

export function getMascotCharacter(sex) {
  return MASCOT_CHARACTERS[sex === 'female' ? 'female' : 'male'];
}

export function resolveMascotSex(profile) {
  return profile?.mascotSex || profile?.sex || 'male';
}

export function getMascotName(sex, t) {
  return t(getMascotCharacter(sex).nameKey);
}

export function getMascotDesc(sex, t) {
  return t(getMascotCharacter(sex).descKey);
}

export const MASCOT_LEVEL_MAP = {
  advanced: 'advanced',
  intermediate: 'intermediate',
  beginner: 'beginner',
  developing: 'beginner',
  unknown: 'beginner',
};

export function resolveMascotLevel(benchmarkLevel) {
  return MASCOT_LEVEL_MAP[benchmarkLevel] || 'beginner';
}
