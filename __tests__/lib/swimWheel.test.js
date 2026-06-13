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
  segmentShouldShowLabel,
  segmentUsesRadialLabel,
} from '../../lib/swimWheel.js';

describe('swimWheel', () => {
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

  it('buildWheelLayout makes 5× the smallest win slice and always labelable', () => {
    const layout = buildWheelLayout(100);
    const coins5 = layout.segments.find((s) => s.id === 'coins-5');
    const coins2 = layout.segments.find((s) => s.id === 'coins-2');
    assert.ok(coins5.sweepDeg < coins2.sweepDeg);
    assert.ok(coins5.sweepDeg < 15, '5× should be a very small slice');
    assert.equal(segmentShouldShowLabel(coins5), true);
    assert.equal(segmentUsesRadialLabel(coins5), true);
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
    });
  });

  it('resolveWheelOutcome free spin refunds bet and grants spins', () => {
    const seg = WHEEL_SEGMENT_DEFS.find((s) => s.id === 'free');
    assert.deepEqual(resolveWheelOutcome(seg, 100), {
      type: 'free_spin',
      coinsDelta: 100,
      freeSpinsGranted: 1,
    });
    assert.deepEqual(resolveWheelOutcome(seg, 100, { usedFreeSpin: true }), {
      type: 'free_spin',
      coinsDelta: 0,
      freeSpinsGranted: 1,
    });
  });

  it('resolveWheelOutcome 2× free spin grants two spins', () => {
    const seg = WHEEL_SEGMENT_DEFS.find((s) => s.id === 'free-2');
    assert.deepEqual(resolveWheelOutcome(seg, 10), {
      type: 'free_spin',
      coinsDelta: 20,
      freeSpinsGranted: 2,
    });
  });

  it('resolveWheelOutcome nothing loses the bet', () => {
    const seg = WHEEL_SEGMENT_DEFS.find((s) => s.id === 'nothing-1');
    assert.deepEqual(resolveWheelOutcome(seg, 10), {
      type: 'nothing',
      coinsDelta: 0,
      amountLost: 10,
    });
  });

  it('canAffordSpin respects balance and free spins', () => {
    assert.equal(canAffordSpin(5, 10, 0), false);
    assert.equal(canAffordSpin(10, 10, 0), true);
    assert.equal(canAffordSpin(0, 100, 1), true);
  });
});
