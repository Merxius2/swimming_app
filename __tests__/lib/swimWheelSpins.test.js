import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DAILY_PAID_SPIN_LIMIT,
  normalizeWheelSpins,
  getPaidSpinsRemaining,
  canUsePaidSpin,
  recordPaidSpin,
  canStartWheelSpin,
} from '../../lib/swimWheelSpins.js';

const TODAY = '2026-06-13';
const YESTERDAY = '2026-06-12';

describe('swimWheelSpins', () => {
  it('resets paid count on a new day', () => {
    assert.deepEqual(
      normalizeWheelSpins({ date: YESTERDAY, paidCount: 3 }, TODAY),
      { date: TODAY, paidCount: 0 }
    );
  });

  it('tracks up to the daily paid spin limit', () => {
    let state = null;
    for (let i = 0; i < DAILY_PAID_SPIN_LIMIT; i += 1) {
      assert.equal(canUsePaidSpin(state, TODAY), true);
      state = recordPaidSpin(state, TODAY);
    }
    assert.equal(getPaidSpinsRemaining(state, TODAY), 0);
    assert.equal(canUsePaidSpin(state, TODAY), false);
  });

  it('canStartWheelSpin allows free spins after paid limit', () => {
    const exhausted = { date: TODAY, paidCount: DAILY_PAID_SPIN_LIMIT };
    assert.equal(canStartWheelSpin(0, 10, 0, exhausted, TODAY), false);
    assert.equal(canStartWheelSpin(0, 10, 1, exhausted, TODAY), true);
  });

  it('canStartWheelSpin requires coins for paid spins', () => {
    assert.equal(canStartWheelSpin(5, 10, 0, null, TODAY), false);
    assert.equal(canStartWheelSpin(10, 10, 0, null, TODAY), true);
  });
});
