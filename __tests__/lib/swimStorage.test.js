import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { SWIM_STORAGE_KEY, DEFAULT_SWIM_DATA } from '../../lib/swimConstants.js';
import { loadSwimData, saveSwimData } from '../../lib/swimStorage.js';

const memory = new Map();

describe('swimStorage reroll persistence', () => {
  beforeEach(() => {
    memory.clear();
    globalThis.window = globalThis;
    globalThis.localStorage = {
      getItem: (key) => memory.get(key) ?? null,
      setItem: (key, value) => memory.set(key, value),
      removeItem: (key) => memory.delete(key),
    };
  });

  afterEach(() => {
    delete globalThis.window;
    delete globalThis.localStorage;
  });

  it('loads reroll credits and normalized monthly reroll state', () => {
    memory.set(SWIM_STORAGE_KEY, JSON.stringify({
      sessions: [],
      profile: { sex: 'male', age: 30 },
      totalCoins: 0,
      monthlyChallengeRerolls: {
        '2025-06': { overrides: { 0: 'kcal' }, freeUsed: true },
      },
      challengeRerollCredits: 2,
    }));

    const data = loadSwimData();
    assert.equal(data.challengeRerollCredits, 2);
    assert.deepEqual(data.monthlyChallengeRerolls['2025-06'], {
      overrides: { 0: 'kcal' },
      freeUsed: true,
    });
  });

  it('migrates legacy single reroll objects on load', () => {
    memory.set(SWIM_STORAGE_KEY, JSON.stringify({
      sessions: [],
      profile: { sex: 'male', age: 30 },
      totalCoins: 0,
      monthlyChallengeRerolls: {
        '2025-06': { tierIndex: 1, type: 'distance' },
      },
    }));

    const data = loadSwimData();
    assert.deepEqual(data.monthlyChallengeRerolls['2025-06'], {
      overrides: { 1: 'distance' },
      freeUsed: true,
    });
  });

  it('migrates legacy bonus spin unlock into credits on load', () => {
    memory.set(SWIM_STORAGE_KEY, JSON.stringify({
      sessions: [],
      profile: { sex: 'male', age: 30 },
      totalCoins: 0,
      storeUnlocks: ['wheel:bonus-spin', 'badge:golden-coins'],
    }));

    const data = loadSwimData();
    assert.equal(data.bonusWheelSpinCredits, 1);
    assert.deepEqual(data.storeUnlocks, ['badge:golden-coins']);
  });

  it('round-trips reroll fields through save and load', () => {
    const payload = {
      sessions: [],
      profile: DEFAULT_SWIM_DATA.profile,
      totalCoins: 500,
      coinsSpent: 0,
      spentCoinClaims: [],
      wheelSpins: null,
      storeUnlocks: [],
      monthlyChallengeRerolls: {
        '2025-07': { overrides: { 2: 'streak' }, freeUsed: false },
      },
      challengeRerollCredits: 3,
      bonusWheelSpinCredits: 2,
    };

    saveSwimData(payload);
    const loaded = loadSwimData();

    assert.equal(loaded.challengeRerollCredits, 3);
    assert.equal(loaded.bonusWheelSpinCredits, 2);
    assert.deepEqual(loaded.monthlyChallengeRerolls, payload.monthlyChallengeRerolls);
  });
});
