export const FREE_THEME_CODES = ['liquid-os'];

export const CHALLENGE_REROLL_STORE_ITEM_ID = 'boost:challenge-reroll';
export const BONUS_WHEEL_SPIN_STORE_ITEM_ID = 'wheel:bonus-spin';

export const STORE_CATEGORIES = ['themes', 'icons', 'vibes', 'flair', 'boosts'];

export const STORE_CATALOG = [
  {
    id: 'theme:gen-z',
    category: 'themes',
    price: 500,
    preview: 'theme',
    themeCode: 'gen-z',
    nameKey: 'coins.store.items.genZ.name',
    descKey: 'coins.store.items.genZ.desc',
  },
  {
    id: 'theme:classic',
    category: 'themes',
    price: 500,
    preview: 'theme',
    themeCode: 'classic',
    nameKey: 'coins.store.items.classic.name',
    descKey: 'coins.store.items.classic.desc',
  },
  {
    id: 'theme:olympic-pool',
    category: 'themes',
    price: 500,
    preview: 'theme',
    themeCode: 'olympic-pool',
    nameKey: 'coins.store.items.olympicPool.name',
    descKey: 'coins.store.items.olympicPool.desc',
  },
  {
    id: 'theme:midnight-lane',
    category: 'themes',
    price: 500,
    preview: 'theme',
    themeCode: 'midnight-lane',
    nameKey: 'coins.store.items.midnightLane.name',
    descKey: 'coins.store.items.midnightLane.desc',
  },
  {
    id: 'theme:retro-wave',
    category: 'themes',
    price: 450,
    preview: 'theme',
    themeCode: 'retro-wave',
    nameKey: 'coins.store.items.retroWave.name',
    descKey: 'coins.store.items.retroWave.desc',
  },
  {
    id: 'theme:tropical-open',
    category: 'themes',
    price: 400,
    preview: 'theme',
    themeCode: 'tropical-open',
    nameKey: 'coins.store.items.tropicalOpen.name',
    descKey: 'coins.store.items.tropicalOpen.desc',
  },
  {
    id: 'theme:gold-luxe',
    category: 'themes',
    price: 1000,
    preview: 'theme',
    themeCode: 'gold-luxe',
    nameKey: 'coins.store.items.goldLuxe.name',
    descKey: 'coins.store.items.goldLuxe.desc',
  },
  {
    id: 'theme:platinum-elite',
    category: 'themes',
    price: 2000,
    preview: 'theme',
    themeCode: 'platinum-elite',
    nameKey: 'coins.store.items.platinumElite.name',
    descKey: 'coins.store.items.platinumElite.desc',
  },
  {
    id: 'icon:gold-medal',
    category: 'icons',
    price: 400,
    preview: 'icon-gold-medal',
    nameKey: 'coins.store.items.goldMedalIcon.name',
    descKey: 'coins.store.items.goldMedalIcon.desc',
  },
  {
    id: 'icon:neon-lane',
    category: 'icons',
    price: 350,
    preview: 'icon-neon-lane',
    nameKey: 'coins.store.items.neonLaneIcon.name',
    descKey: 'coins.store.items.neonLaneIcon.desc',
  },
  {
    id: 'icon:trophy-splash',
    category: 'icons',
    price: 450,
    preview: 'icon-trophy-splash',
    nameKey: 'coins.store.items.trophySplashIcon.name',
    descKey: 'coins.store.items.trophySplashIcon.desc',
  },
  {
    id: 'icon:platinum-star',
    category: 'icons',
    price: 550,
    preview: 'icon-platinum-star',
    nameKey: 'coins.store.items.platinumStarIcon.name',
    descKey: 'coins.store.items.platinumStarIcon.desc',
  },
  {
    id: 'ambient:neon-lagoon',
    category: 'vibes',
    price: 250,
    preview: 'ambient-neon',
    nameKey: 'coins.store.items.neonLagoon.name',
    descKey: 'coins.store.items.neonLagoon.desc',
  },
  {
    id: 'ambient:sunset-lap',
    category: 'vibes',
    price: 250,
    preview: 'ambient-sunset',
    nameKey: 'coins.store.items.sunsetLap.name',
    descKey: 'coins.store.items.sunsetLap.desc',
  },
  {
    id: 'ambient:bubble-trail',
    category: 'vibes',
    price: 175,
    preview: 'ambient-bubbles',
    nameKey: 'coins.store.items.bubbleTrail.name',
    descKey: 'coins.store.items.bubbleTrail.desc',
  },
  {
    id: 'ambient:aurora-lap',
    category: 'vibes',
    price: 275,
    preview: 'ambient-aurora',
    nameKey: 'coins.store.items.auroraLap.name',
    descKey: 'coins.store.items.auroraLap.desc',
  },
  {
    id: 'ambient:deep-current',
    category: 'vibes',
    price: 300,
    preview: 'ambient-deep',
    nameKey: 'coins.store.items.deepCurrent.name',
    descKey: 'coins.store.items.deepCurrent.desc',
  },
  {
    id: 'badge:golden-coins',
    category: 'flair',
    price: 150,
    preview: 'golden-coins',
    nameKey: 'coins.store.items.goldenCoins.name',
    descKey: 'coins.store.items.goldenCoins.desc',
  },
  {
    id: 'celebration:confetti-cannon',
    category: 'flair',
    price: 200,
    preview: 'confetti',
    nameKey: 'coins.store.items.confettiCannon.name',
    descKey: 'coins.store.items.confettiCannon.desc',
  },
  {
    id: 'flair:medal-shimmer',
    category: 'flair',
    price: 225,
    preview: 'medal-shimmer',
    nameKey: 'coins.store.items.medalShimmer.name',
    descKey: 'coins.store.items.medalShimmer.desc',
  },
  {
    id: 'boost:challenge-reroll',
    category: 'boosts',
    price: 500,
    consumable: true,
    preview: 'challenge-reroll',
    nameKey: 'coins.store.items.challengeReroll.name',
    descKey: 'coins.store.items.challengeReroll.desc',
  },
  {
    id: 'wheel:bonus-spin',
    category: 'boosts',
    price: 350,
    consumable: true,
    preview: 'bonus-spin',
    nameKey: 'coins.store.items.bonusSpin.name',
    descKey: 'coins.store.items.bonusSpin.desc',
  },
];

const CATALOG_IDS = new Set(STORE_CATALOG.map((item) => item.id));

const LEGACY_THEME_IDS = Object.fromEntries(
  STORE_CATALOG.filter((item) => item.themeCode).map((item) => [item.themeCode, item.id])
);

export function getStoreItem(id) {
  return STORE_CATALOG.find((item) => item.id === id) || null;
}

/** Sum catalog prices for owned unlocks — used to backfill legacy coinsSpent. */
export function sumStorePurchasePrices(storeUnlocks = []) {
  return normalizeStoreUnlocks(storeUnlocks).reduce((sum, id) => {
    const item = getStoreItem(id);
    return sum + (item?.price ?? 0);
  }, 0);
}

export function migrateCoinsSpent(raw, storeUnlocks = []) {
  if (typeof raw === 'number' && !Number.isNaN(raw)) {
    return Math.max(0, raw);
  }
  return sumStorePurchasePrices(storeUnlocks);
}

export function getStoreItemsByCategory(category) {
  return STORE_CATALOG.filter((item) => item.category === category);
}

export function normalizeStoreUnlocks(raw, legacyPurchasedThemes = []) {
  const ids = new Set();

  if (Array.isArray(raw)) {
    raw.forEach((entry) => {
      if (CATALOG_IDS.has(entry)) {
        ids.add(entry);
        return;
      }
      const mapped = LEGACY_THEME_IDS[entry];
      if (mapped) ids.add(mapped);
    });
  }

  if (Array.isArray(legacyPurchasedThemes)) {
    legacyPurchasedThemes.forEach((code) => {
      const mapped = LEGACY_THEME_IDS[code];
      if (mapped) ids.add(mapped);
    });
  }

  return STORE_CATALOG.map((item) => item.id).filter((id) => ids.has(id));
}

export function getUnlockedThemes(themes, storeUnlocks = [], allThemesUnlocked = false) {
  return themes.filter((item) => isThemeUnlocked(item.code, storeUnlocks, allThemesUnlocked));
}

export function isStoreItemOwned(id, storeUnlocks = []) {
  return normalizeStoreUnlocks(storeUnlocks).includes(id);
}

export function isThemeUnlocked(themeCode, storeUnlocks = [], allThemesUnlocked = false) {
  if (allThemesUnlocked || FREE_THEME_CODES.includes(themeCode)) return true;
  return isStoreItemOwned(`theme:${themeCode}`, storeUnlocks);
}

export function isConsumableStoreItem(id) {
  return Boolean(getStoreItem(id)?.consumable);
}

export function canPurchaseStoreItem(id, storeUnlocks, totalCoins) {
  if (!CATALOG_IDS.has(id)) return false;
  const item = getStoreItem(id);
  if (item.consumable) return (totalCoins ?? 0) >= item.price;
  if (isStoreItemOwned(id, storeUnlocks)) return false;
  return (totalCoins ?? 0) >= item.price;
}

/** @deprecated */
export function canPurchaseTheme(themeCode, storeUnlocks, totalCoins) {
  return canPurchaseStoreItem(`theme:${themeCode}`, storeUnlocks, totalCoins);
}

export function purchaseConsumableStoreItemUpdate(id, totalCoins, coinsSpent = 0) {
  const item = getStoreItem(id);
  if (!item?.consumable || (totalCoins ?? 0) < item.price) return null;
  return {
    totalCoins: Math.max(0, (totalCoins ?? 0) - item.price),
    coinsSpent: Math.max(0, (coinsSpent ?? 0) + item.price),
  };
}

export function purchaseStoreItemUpdate(id, storeUnlocks, totalCoins, coinsSpent = 0) {
  if (!canPurchaseStoreItem(id, storeUnlocks, totalCoins)) return null;
  const item = getStoreItem(id);
  return {
    storeUnlocks: [...normalizeStoreUnlocks(storeUnlocks), id],
    totalCoins: Math.max(0, (totalCoins ?? 0) - item.price),
    coinsSpent: Math.max(0, (coinsSpent ?? 0) + item.price),
  };
}

export function normalizeBonusWheelSpinCredits(raw, storeUnlocks = []) {
  let credits = Math.max(0, Number(raw) || 0);
  if (normalizeStoreUnlocks(storeUnlocks).includes(BONUS_WHEEL_SPIN_STORE_ITEM_ID)) {
    credits += 1;
  }
  return credits;
}

export function stripBonusSpinUnlock(storeUnlocks = []) {
  return normalizeStoreUnlocks(storeUnlocks).filter((id) => id !== BONUS_WHEEL_SPIN_STORE_ITEM_ID);
}

export function getBonusPaidSpins(bonusWheelSpinCredits = 0) {
  return Math.max(0, Number(bonusWheelSpinCredits) || 0);
}

export function getDailyPaidSpinLimit(bonusWheelSpinCredits = 0) {
  return 3 + getBonusPaidSpins(bonusWheelSpinCredits);
}

export function hasGoldenCoinBadge(storeUnlocks = []) {
  return isStoreItemOwned('badge:golden-coins', storeUnlocks);
}

export function hasConfettiCannon(storeUnlocks = []) {
  return isStoreItemOwned('celebration:confetti-cannon', storeUnlocks);
}

export function hasMedalShimmerPlus(storeUnlocks = []) {
  return isStoreItemOwned('flair:medal-shimmer', storeUnlocks);
}

export function sanitizeProfileCosmetics(profile, storeUnlocks = []) {
  const next = { ...profile };
  delete next.swimmerTitle;
  if (next.activeAmbient && !isStoreItemOwned(next.activeAmbient, storeUnlocks)) {
    next.activeAmbient = null;
  }
  if (next.activeAppIcon && !isStoreItemOwned(next.activeAppIcon, storeUnlocks)) {
    next.activeAppIcon = null;
  }
  return next;
}
