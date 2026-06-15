import {
  Award,
  BarChart3,
  Coins,
  History,
  Settings,
  TrendingUp,
  Upload,
} from 'lucide-react';
import { isStoreItemOwned } from './swimCoinStore.js';

export const PAGE_ICON_KEYS = [
  'progress',
  'upload',
  'history',
  'benchmark',
  'medals',
  'coins',
  'settings',
];

const LUCIDE_PAGE_ICON_MAP = new Map([
  [BarChart3, 'progress'],
  [Upload, 'upload'],
  [History, 'history'],
  [TrendingUp, 'benchmark'],
  [Award, 'medals'],
  [Coins, 'coins'],
  [Settings, 'settings'],
]);

const ICON_SET_SLUGS = {
  'icon:gold-medal': 'gold-medal',
  'icon:neon-lane': 'neon-lane',
  'icon:trophy-splash': 'trophy-splash',
  'icon:platinum-star': 'platinum-star',
};

export function getPageIconKey(IconComponent) {
  if (!IconComponent) return null;
  return LUCIDE_PAGE_ICON_MAP.get(IconComponent) || null;
}

export function resolveStorePageIconPath(activeAppIcon, pageKey, storeUnlocks = []) {
  if (!pageKey || !activeAppIcon || !isStoreItemOwned(activeAppIcon, storeUnlocks)) {
    return null;
  }
  const slug = ICON_SET_SLUGS[activeAppIcon];
  if (!slug || !PAGE_ICON_KEYS.includes(pageKey)) return null;
  return `/icons/store/page-icons/${slug}/${pageKey}.svg`;
}
