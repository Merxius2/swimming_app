import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SWIM_DATA } from '../../lib/swimConstants.js';
import { CHALLENGE_REROLL_STORE_ITEM_ID, BONUS_WHEEL_SPIN_STORE_ITEM_ID } from '../../lib/swimCoinStore.js';
import {
  applyMonthlyChallengeReroll,
  applyConsumableStorePurchase,
} from '../../lib/swimChallengeRerollStorage.js';

const baseData = () => ({
  ...DEFAULT_SWIM_DATA,
  sessions: [],
  totalCoins: 1000,
});

describe('swimChallengeRerollStorage', () => {
  it('uses the free monthly reroll without spending credits', () => {
    const monthKey = '2025-06';
    const result = applyMonthlyChallengeReroll(baseData(), monthKey, 0);

    assert.equal(result.success, true);
    assert.equal(result.data.challengeRerollCredits, 0);
    assert.equal(result.data.monthlyChallengeRerolls[monthKey].freeUsed, true);
    assert.ok(result.data.monthlyChallengeRerolls[monthKey].overrides[0]);
  });

  it('spends one credit for a second reroll in the same month', () => {
    const monthKey = '2025-06';
    const afterFree = applyMonthlyChallengeReroll(baseData(), monthKey, 0).data;
    const withCredit = { ...afterFree, challengeRerollCredits: 1 };
    const result = applyMonthlyChallengeReroll(withCredit, monthKey, 1);

    assert.equal(result.success, true);
    assert.equal(result.data.challengeRerollCredits, 0);
    assert.equal(result.data.monthlyChallengeRerolls[monthKey].freeUsed, true);
    assert.ok(result.data.monthlyChallengeRerolls[monthKey].overrides[1]);
  });

  it('blocks a paid reroll when no credits remain', () => {
    const monthKey = '2025-06';
    const afterFree = applyMonthlyChallengeReroll(baseData(), monthKey, 0).data;
    const result = applyMonthlyChallengeReroll(afterFree, monthKey, 1);

    assert.equal(result.success, false);
    assert.deepEqual(result.data, afterFree);
  });

  it('grants a reroll credit when purchasing the store consumable', () => {
    const result = applyConsumableStorePurchase(baseData(), CHALLENGE_REROLL_STORE_ITEM_ID);

    assert.equal(result.purchased, true);
    assert.equal(result.data.challengeRerollCredits, 1);
    assert.equal(result.data.totalCoins, 500);
    assert.equal(result.data.coinsSpent, 500);
  });

  it('grants a bonus spin credit when purchasing the wheel consumable', () => {
    const result = applyConsumableStorePurchase(baseData(), BONUS_WHEEL_SPIN_STORE_ITEM_ID);

    assert.equal(result.purchased, true);
    assert.equal(result.data.bonusWheelSpinCredits, 1);
    assert.equal(result.data.totalCoins, 650);
    assert.equal(result.data.coinsSpent, 350);
  });

  it('rejects consumable purchase when coins are insufficient', () => {
    const poor = { ...baseData(), totalCoins: 100 };
    const result = applyConsumableStorePurchase(poor, CHALLENGE_REROLL_STORE_ITEM_ID);

    assert.equal(result.purchased, false);
    assert.deepEqual(result.data, poor);
  });
});
