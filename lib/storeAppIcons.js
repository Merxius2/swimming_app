import { APP_ICON_192, APP_ICON_512 } from './appConstants';
import { isStoreItemOwned } from './swimCoinStore';

export const DEFAULT_APP_ICON_SET = {
  favicon: APP_ICON_192,
  appleTouchIcon: APP_ICON_192,
  pwa192: APP_ICON_192,
  pwa512: APP_ICON_512,
  ui: APP_ICON_192,
};

export const DEFAULT_APP_ICON_PATH = DEFAULT_APP_ICON_SET.ui;

export const APP_ICON_PRESETS = {
  'icon:gold-medal': {
    favicon: '/icons/store/gold-medal.svg',
    appleTouchIcon: '/icons/store/gold-medal-192.png',
    pwa192: '/icons/store/gold-medal-192.png',
    pwa512: '/icons/store/gold-medal-512.png',
    ui: '/icons/store/gold-medal-192.png',
    preview: 'linear-gradient(135deg, #F59E0B 0%, #FDE68A 50%, #B45309 100%)',
  },
  'icon:neon-lane': {
    favicon: '/icons/store/neon-lane.svg',
    appleTouchIcon: '/icons/store/neon-lane-192.png',
    pwa192: '/icons/store/neon-lane-192.png',
    pwa512: '/icons/store/neon-lane-512.png',
    ui: '/icons/store/neon-lane-192.png',
    preview: 'linear-gradient(135deg, #020617 0%, #0891B2 45%, #FF00AA 100%)',
  },
  'icon:trophy-splash': {
    favicon: '/icons/store/trophy-splash.svg',
    appleTouchIcon: '/icons/store/trophy-splash-192.png',
    pwa192: '/icons/store/trophy-splash-192.png',
    pwa512: '/icons/store/trophy-splash-512.png',
    ui: '/icons/store/trophy-splash-192.png',
    preview: 'linear-gradient(135deg, #0066CC 0%, #38BDF8 55%, #F5C518 100%)',
  },
  'icon:platinum-star': {
    favicon: '/icons/store/platinum-star.svg',
    appleTouchIcon: '/icons/store/platinum-star-192.png',
    pwa192: '/icons/store/platinum-star-192.png',
    pwa512: '/icons/store/platinum-star-512.png',
    ui: '/icons/store/platinum-star-192.png',
    preview: 'linear-gradient(135deg, #64748B 0%, #E2E8F0 45%, #94A3B8 100%)',
  },
};

export function getAppIconPreset(iconId) {
  return APP_ICON_PRESETS[iconId] || null;
}

export function resolveAppIconSet(activeAppIcon, storeUnlocks = []) {
  if (activeAppIcon && isStoreItemOwned(activeAppIcon, storeUnlocks)) {
    const preset = getAppIconPreset(activeAppIcon);
    if (preset) return preset;
  }
  return DEFAULT_APP_ICON_SET;
}

/** @deprecated use resolveAppIconSet */
export function resolveAppIconPath(activeAppIcon, storeUnlocks = []) {
  return resolveAppIconSet(activeAppIcon, storeUnlocks).ui;
}
