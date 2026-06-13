import { APP_ICON_192 } from './appConstants';
import { isStoreItemOwned } from './swimCoinStore';

export const DEFAULT_APP_ICON_PATH = APP_ICON_192;

export const APP_ICON_PRESETS = {
  'icon:gold-medal': {
    path: '/icons/store/gold-medal.svg',
    preview: 'linear-gradient(135deg, #F59E0B 0%, #FDE68A 50%, #B45309 100%)',
  },
  'icon:neon-lane': {
    path: '/icons/store/neon-lane.svg',
    preview: 'linear-gradient(135deg, #020617 0%, #0891B2 45%, #FF00AA 100%)',
  },
  'icon:trophy-splash': {
    path: '/icons/store/trophy-splash.svg',
    preview: 'linear-gradient(135deg, #0066CC 0%, #38BDF8 55%, #F5C518 100%)',
  },
  'icon:platinum-star': {
    path: '/icons/store/platinum-star.svg',
    preview: 'linear-gradient(135deg, #64748B 0%, #E2E8F0 45%, #94A3B8 100%)',
  },
};

export function getAppIconPreset(iconId) {
  return APP_ICON_PRESETS[iconId] || null;
}

export function resolveAppIconPath(activeAppIcon, storeUnlocks = []) {
  if (activeAppIcon && isStoreItemOwned(activeAppIcon, storeUnlocks)) {
    const preset = getAppIconPreset(activeAppIcon);
    if (preset) return preset.path;
  }
  return DEFAULT_APP_ICON_PATH;
}
