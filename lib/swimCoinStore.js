export const THEME_STORE_PRICE = 500;

export const FREE_THEME_CODES = ['liquid-os'];

export const STORED_THEME_CODES = ['gen-z', 'classic'];

export function normalizePurchasedThemes(raw) {
  if (!Array.isArray(raw)) return [];
  return STORED_THEME_CODES.filter((code) => raw.includes(code));
}

export function isThemeUnlocked(themeCode, purchasedThemes = []) {
  if (FREE_THEME_CODES.includes(themeCode)) return true;
  return normalizePurchasedThemes(purchasedThemes).includes(themeCode);
}

export function canPurchaseTheme(themeCode, purchasedThemes, totalCoins) {
  if (!STORED_THEME_CODES.includes(themeCode)) return false;
  if (isThemeUnlocked(themeCode, purchasedThemes)) return false;
  return (totalCoins ?? 0) >= THEME_STORE_PRICE;
}

export function purchaseThemeUpdate(themeCode, purchasedThemes, totalCoins) {
  if (!canPurchaseTheme(themeCode, purchasedThemes, totalCoins)) {
    return null;
  }

  return {
    purchasedThemes: [...normalizePurchasedThemes(purchasedThemes), themeCode],
    totalCoins: Math.max(0, (totalCoins ?? 0) - THEME_STORE_PRICE),
  };
}
