export const MASCOT_LOOKS = {
  coach: {
    id: 'coach',
    nameKey: 'settings.mascotLookCoachName',
    descKey: 'settings.mascotLookCoachDesc',
  },
  classic: {
    id: 'classic',
    nameKey: 'settings.mascotLookClassicName',
    descKey: 'settings.mascotLookClassicDesc',
  },
};

export const MASCOT_CHARACTERS = {
  male: {
    id: 'flip',
    nameKey: 'settings.mascotFlipName',
    descKey: 'settings.mascotFlipDesc',
  },
  female: {
    id: 'flo',
    nameKey: 'settings.mascotFloName',
    descKey: 'settings.mascotFloDesc',
  },
};

export function resolveMascotSex(profile) {
  return profile?.mascotSex || profile?.sex || 'male';
}

export function resolveMascotLook(profile) {
  return profile?.mascotLook === 'classic' ? 'classic' : 'coach';
}

export function getMascotName(sex, t) {
  const character = MASCOT_CHARACTERS[sex === 'female' ? 'female' : 'male'];
  return t(character.nameKey);
}

export function getMascotDesc(sex, t) {
  const character = MASCOT_CHARACTERS[sex === 'female' ? 'female' : 'male'];
  return t(character.descKey);
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
