/**
 * Swim app constants — themes, languages, and icon paths.
 */

export const APP_ICON_192 = '/icon-sc-192.png';
export const APP_ICON_512 = '/icon-sc-512.png';

export const DEFAULT_LANGUAGE = 'en';

export const LANGUAGES = [
  { code: 'en', flag: '🇬🇧', name: 'English', icon: APP_ICON_192 },
  { code: 'nl', flag: '🇳🇱', name: 'Dutch', icon: APP_ICON_192 },
  { code: 'ru', flag: '🇷🇺', name: 'Russian', icon: APP_ICON_192 },
  { code: 'tr', flag: '🇹🇷', name: 'Turkish', icon: APP_ICON_192 },
];

export const DEFAULT_THEME = 'liquid-os';

export const THEMES = [
  {
    code: 'liquid-os',
    nameKey: 'settings.themes.liquidOs.name',
    descKey: 'settings.themes.liquidOs.desc',
    preview: {
      from: '#3B5BFF',
      via: '#7B5BFF',
      to: '#E85A8C',
    },
  },
  {
    code: 'gen-z',
    nameKey: 'settings.themes.genZ.name',
    descKey: 'settings.themes.genZ.desc',
    previewStyle: 'flat',
    preview: {
      from: '#6200EE',
      via: '#D4FF00',
      to: '#FF69B4',
    },
  },
  {
    code: 'classic',
    nameKey: 'settings.themes.classic.name',
    descKey: 'settings.themes.classic.desc',
    previewStyle: 'flat',
    fontFamily: 'Oxanium',
    preview: {
      from: '#DF0024',
      via: '#F3AF00',
      to: '#008FD6',
      quaternary: '#00AB9F',
    },
  },
  {
    code: 'olympic-pool',
    nameKey: 'settings.themes.olympicPool.name',
    descKey: 'settings.themes.olympicPool.desc',
    previewStyle: 'flat',
    preview: {
      from: '#F8FAFC',
      via: '#0066CC',
      to: '#F5C518',
    },
  },
  {
    code: 'midnight-lane',
    nameKey: 'settings.themes.midnightLane.name',
    descKey: 'settings.themes.midnightLane.desc',
    previewStyle: 'flat',
    preview: {
      from: '#070B14',
      via: '#22D3EE',
      to: '#0891B2',
    },
  },
  {
    code: 'retro-wave',
    nameKey: 'settings.themes.retroWave.name',
    descKey: 'settings.themes.retroWave.desc',
    previewStyle: 'flat',
    fontFamily: 'Oxanium',
    preview: {
      from: '#FF6EC7',
      via: '#9D4EDD',
      to: '#5CE1E6',
    },
  },
  {
    code: 'tropical-open',
    nameKey: 'settings.themes.tropicalOpen.name',
    descKey: 'settings.themes.tropicalOpen.desc',
    preview: {
      from: '#38BDF8',
      via: '#0D9488',
      to: '#FB7185',
    },
  },
  {
    code: 'gold-luxe',
    nameKey: 'settings.themes.goldLuxe.name',
    descKey: 'settings.themes.goldLuxe.desc',
    previewStyle: 'flat',
    preview: {
      from: '#FFF8E7',
      via: '#F5D565',
      to: '#B45309',
    },
  },
  {
    code: 'platinum-elite',
    nameKey: 'settings.themes.platinumElite.name',
    descKey: 'settings.themes.platinumElite.desc',
    previewStyle: 'flat',
    preview: {
      from: '#F8FAFC',
      via: '#CBD5E1',
      to: '#64748B',
      quaternary: '#A5B4FC',
    },
  },
];
