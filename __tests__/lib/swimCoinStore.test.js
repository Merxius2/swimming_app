import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  canPurchaseStoreItem,
  canPurchaseTheme,
  getDailyPaidSpinLimit,
  getStoreItem,
  getUnlockedThemes,
  hasConfettiCannon,
  hasGoldenCoinBadge,
  isConsumableStoreItem,
  isStoreItemOwned,
  isThemeUnlocked,
  normalizeStoreUnlocks,
  purchaseConsumableStoreItemUpdate,
  purchaseStoreItemUpdate,
  CHALLENGE_REROLL_STORE_ITEM_ID,
} from '../../lib/swimCoinStore.js';

describe('swimCoinStore', () => {
  it('liquid-os is always unlocked', () => {
    assert.equal(isThemeUnlocked('liquid-os', []), true);
  });

  it('store themes require purchase via store unlock ids', () => {
    assert.equal(isThemeUnlocked('gen-z', []), false);
    assert.equal(isThemeUnlocked('gen-z', ['theme:gen-z']), true);
  });

  it('migrates bare theme codes in storeUnlocks', () => {
    assert.deepEqual(normalizeStoreUnlocks(['gen-z', 'classic']), ['theme:gen-z', 'theme:classic']);
    assert.equal(isThemeUnlocked('gen-z', ['gen-z']), true);
  });

  it('migrates legacy purchased theme codes', () => {
    assert.deepEqual(normalizeStoreUnlocks([], ['gen-z', 'classic']), ['theme:gen-z', 'theme:classic']);
  });

  it('can purchase when enough coins and not owned', () => {
    assert.equal(canPurchaseStoreItem('theme:classic', [], 500), true);
    assert.equal(canPurchaseStoreItem('theme:classic', ['theme:classic'], 500), false);
    assert.equal(canPurchaseStoreItem('badge:golden-coins', [], 149), false);
  });

  it('purchase deducts item price and records unlock', () => {
    const result = purchaseStoreItemUpdate('badge:golden-coins', [], 200);
    assert.deepEqual(result, {
      storeUnlocks: ['badge:golden-coins'],
      totalCoins: 50,
      coinsSpent: 150,
    });
  });

  it('bonus spin raises daily limit', () => {
    assert.equal(getDailyPaidSpinLimit([]), 3);
    assert.equal(getDailyPaidSpinLimit(['wheel:bonus-spin']), 4);
  });

  it('flair helpers reflect ownership', () => {
    const unlocks = ['badge:golden-coins', 'celebration:confetti-cannon'];
    assert.equal(hasGoldenCoinBadge(unlocks), true);
    assert.equal(hasConfettiCannon(unlocks), true);
    assert.equal(isStoreItemOwned('ambient:neon-lagoon', unlocks), false);
  });

  it('allThemesUnlocked cheat bypasses store purchase', () => {
    assert.equal(isThemeUnlocked('retro-wave', [], true), true);
    assert.equal(isThemeUnlocked('gen-z', [], true), true);
    assert.deepEqual(
      getUnlockedThemes(
        [{ code: 'liquid-os' }, { code: 'gen-z' }, { code: 'classic' }],
        [],
        true
      ).map((t) => t.code),
      ['liquid-os', 'gen-z', 'classic']
    );
  });

  it('premium themes have tiered pricing', () => {
    assert.equal(getStoreItem('theme:gold-luxe').price, 1000);
    assert.equal(getStoreItem('theme:platinum-elite').price, 2000);
    assert.equal(canPurchaseStoreItem('theme:gold-luxe', [], 999), false);
    assert.equal(canPurchaseStoreItem('theme:platinum-elite', [], 1999), false);
  });

  it('app icon store items require purchase', () => {
    assert.equal(isStoreItemOwned('icon:gold-medal', []), false);
    assert.equal(isStoreItemOwned('icon:gold-medal', ['icon:gold-medal']), true);
  });

  it('deprecated theme helpers still work', () => {
    assert.equal(canPurchaseTheme('classic', [], 500), true);
    const result = purchaseStoreItemUpdate('theme:gen-z', [], 600);
    assert.equal(result.totalCoins, 100);
    assert.deepEqual(result.storeUnlocks, ['theme:gen-z']);
  });

  it('consumable challenge reroll can be purchased repeatedly', () => {
    assert.equal(isConsumableStoreItem(CHALLENGE_REROLL_STORE_ITEM_ID), true);
    assert.equal(canPurchaseStoreItem(CHALLENGE_REROLL_STORE_ITEM_ID, [], 500), true);
    assert.equal(canPurchaseStoreItem(CHALLENGE_REROLL_STORE_ITEM_ID, [], 499), false);

    const first = purchaseConsumableStoreItemUpdate(CHALLENGE_REROLL_STORE_ITEM_ID, 1200, 0);
    assert.deepEqual(first, { totalCoins: 700, coinsSpent: 500 });

    const second = purchaseConsumableStoreItemUpdate(CHALLENGE_REROLL_STORE_ITEM_ID, 700, 500);
    assert.deepEqual(second, { totalCoins: 200, coinsSpent: 1000 });
  });
});
