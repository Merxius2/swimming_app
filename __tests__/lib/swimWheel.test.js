import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  WHEEL_SEGMENT_DEFS,
  MIN_NOTHING_SHARE,
  buildWheelLayout,
  combinedNothingSweepDeg,
  nothingCombinedShare,
  pickRandomSegmentIndex,
  getSpinRotation,
  resolveWheelOutcome,
  canAffordSpin,
  betSegmentWeight,
} from '../../lib/swimWheel.js';

describe('swimWheel', () => {
  it('betSegmentWeight floors small bets for readability', () => {
    assert.equal(betSegmentWeight(1), 5);
    assert.equal(betSegmentWeight(100), 100);
  });

  it('nothingCombinedShare is at least 50% and shrinks slightly on high bets', () => {
    assert.equal(nothingCombinedShare(100), MIN_NOTHING_SHARE);
    assert.ok(nothingCombinedShare(1) > nothingCombinedShare(100));
    assert.ok(nothingCombinedShare(1) >= MIN_NOTHING_SHARE);
  });

  it('buildWheelLayout gives nothing at least half the wheel', () => {
    for (const bet of [1, 10, 100]) {
      const layout = buildWheelLayout(bet);
      const nothingSweep = combinedNothingSweepDeg(layout);
      assert.ok(nothingSweep >= 180 - 0.01, `bet ${bet}: nothing sweep ${nothingSweep}`);
      assert.ok(Math.abs(
        layout.segments.reduce((sum, s) => sum + s.sweepDeg, 0) - 360
      ) < 0.01);
    }
  });

  it('buildWheelLayout scales prize slice with bet', () => {
    const low = buildWheelLayout(1);
    const high = buildWheelLayout(100);
    const prizeSweepLow = low.segments.find((s) => s.type === 'prize').sweepDeg;
    const prizeSweepHigh = high.segments.find((s) => s.type === 'prize').sweepDeg;
    assert.ok(prizeSweepHigh > prizeSweepLow);
  });

  it('pickRandomSegmentIndex stays in range', () => {
    const layout = buildWheelLayout(10);
    for (let i = 0; i < 50; i += 1) {
      const idx = pickRandomSegmentIndex(layout);
      assert.ok(idx >= 0);
      assert.ok(idx < WHEEL_SEGMENT_DEFS.length);
    }
  });

  it('getSpinRotation increases monotonically', () => {
    const layout = buildWheelLayout(10);
    const r1 = getSpinRotation(0, layout, 0);
    const r2 = getSpinRotation(3, layout, r1);
    assert.ok(r2 > r1);
  });

  it('resolveWheelOutcome coins pays bet × multiplier', () => {
    const seg = WHEEL_SEGMENT_DEFS.find((s) => s.id === 'coins-3');
    assert.deepEqual(resolveWheelOutcome(seg, 10), {
      type: 'coins',
      multiplier: 3,
      coinsDelta: 30,
      freeSpin: false,
    });
  });

  it('resolveWheelOutcome free spin refunds bet', () => {
    const seg = WHEEL_SEGMENT_DEFS.find((s) => s.id === 'free');
    assert.deepEqual(resolveWheelOutcome(seg, 100), {
      type: 'free_spin',
      coinsDelta: 100,
      freeSpin: true,
    });
  });

  it('resolveWheelOutcome prize gives nothing', () => {
    const seg = WHEEL_SEGMENT_DEFS.find((s) => s.id === 'prize');
    assert.deepEqual(resolveWheelOutcome(seg, 10), {
      type: 'prize',
      coinsDelta: 0,
      freeSpin: false,
    });
  });

  it('resolveWheelOutcome nothing loses the bet', () => {
    const seg = WHEEL_SEGMENT_DEFS.find((s) => s.id === 'nothing');
    assert.deepEqual(resolveWheelOutcome(seg, 10), {
      type: 'nothing',
      coinsDelta: 0,
      freeSpin: false,
      amountLost: 10,
    });
  });

  it('canAffordSpin respects balance and free spin', () => {
    assert.equal(canAffordSpin(5, 10, false), false);
    assert.equal(canAffordSpin(10, 10, false), true);
    assert.equal(canAffordSpin(0, 100, true), true);
  });
});
