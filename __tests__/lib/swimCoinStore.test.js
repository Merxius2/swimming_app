import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  THEME_STORE_PRICE,
  canPurchaseTheme,
  isThemeUnlocked,
  normalizePurchasedThemes,
  purchaseThemeUpdate,
} from '../../lib/swimCoinStore.js';

describe('swimCoinStore', () => {
  it('liquid-os is always unlocked', () => {
    assert.equal(isThemeUnlocked('liquid-os', []), true);
  });

  it('store themes require purchase', () => {
    assert.equal(isThemeUnlocked('gen-z', []), false);
    assert.equal(isThemeUnlocked('gen-z', ['gen-z']), true);
  });

  it('normalizes purchased themes', () => {
    assert.deepEqual(normalizePurchasedThemes(['gen-z', 'unknown', 'classic']), ['gen-z', 'classic']);
  });

  it('can purchase when enough coins and not owned', () => {
    assert.equal(canPurchaseTheme('classic', [], THEME_STORE_PRICE), true);
    assert.equal(canPurchaseTheme('classic', ['classic'], THEME_STORE_PRICE), false);
    assert.equal(canPurchaseTheme('classic', [], THEME_STORE_PRICE - 1), false);
  });

  it('purchase deducts coins and records theme', () => {
    const result = purchaseThemeUpdate('gen-z', [], 600);
    assert.deepEqual(result, {
      purchasedThemes: ['gen-z'],
      totalCoins: 100,
    });
    assert.equal(purchaseThemeUpdate('gen-z', [], 400), null);
  });
});
