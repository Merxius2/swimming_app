import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getPersonalRecords } from '../../lib/swimRecords.js';
import { evaluateAllMedals, buildMedalContext, getNewlyEarnedMedals } from '../../lib/swimMedals.js';

const session = (id, date, metrics) => ({ id, date, metrics });

describe('getPersonalRecords', () => {
  it('returns null for empty sessions', () => {
    assert.equal(getPersonalRecords([]), null);
  });

  it('picks best values across sessions', () => {
    const sessions = [
      session('a', '2025-06-01', { distanceM: 2000, paceSecPer100m: 130, activeKcal: 400 }),
      session('b', '2025-06-02', { distanceM: 2550, paceSecPer100m: 115, activeKcal: 520, laps: 102 }),
    ];
    const records = getPersonalRecords(sessions);
    assert.equal(records.longestDistance.value, 2550);
    assert.equal(records.longestDistance.sessionId, 'b');
    assert.equal(records.fastestPace.value, 115);
    assert.equal(records.mostActiveCalories.value, 520);
    assert.equal(records.mostLaps.value, 102);
  });
});

describe('evaluateAllMedals', () => {
  it('awards first splash with one session', () => {
    const medals = evaluateAllMedals([
      session('1', '2025-06-10', { distanceM: 500 }),
    ]);
    const first = medals.find((m) => m.id === 'first_splash');
    assert.equal(first.earned, true);
  });

  it('awards four sessions in a week', () => {
    const sessions = [
      session('1', '2025-06-09', { distanceM: 1000 }),
      session('2', '2025-06-10', { distanceM: 1000 }),
      session('3', '2025-06-11', { distanceM: 1000 }),
      session('4', '2025-06-12', { distanceM: 1000 }),
    ];
    const medals = evaluateAllMedals(sessions);
    assert.equal(medals.find((m) => m.id === 'four_sessions_week').earned, true);
  });

  it('tracks monthly 10k medal with period', () => {
    const sessions = Array.from({ length: 5 }, (_, i) =>
      session(String(i), `2025-06-${String(i + 1).padStart(2, '0')}`, { distanceM: 2100 })
    );
    const medals = evaluateAllMedals(sessions);
    const tenK = medals.find((m) => m.id === 'ten_k_month');
    assert.equal(tenK.earned, true);
    assert.ok(tenK.periods.includes('2025-06'));
  });

  it('includes progress for unearned medals', () => {
    const medals = evaluateAllMedals([
      session('1', '2025-06-10', { distanceM: 1500 }),
    ]);
    const tenK = medals.find((m) => m.id === 'ten_k_lifetime');
    assert.equal(tenK.earned, false);
    assert.ok(tenK.progress);
    assert.equal(tenK.progress.percent, 15);
    assert.equal(tenK.progress.current, 1500);
    assert.equal(tenK.progress.target, 10000);
  });

  it('awards hat trick for three consecutive days', () => {
    const medals = evaluateAllMedals([
      session('1', '2025-06-10', { distanceM: 1000 }),
      session('2', '2025-06-11', { distanceM: 1000 }),
      session('3', '2025-06-12', { distanceM: 1000 }),
    ]);
    assert.equal(medals.find((m) => m.id === 'hat_trick').earned, true);
  });

  it('omits progress for earned medals', () => {
    const medals = evaluateAllMedals([
      session('1', '2025-06-10', { distanceM: 500 }),
    ]);
    const first = medals.find((m) => m.id === 'first_splash');
    assert.equal(first.earned, true);
    assert.equal(first.progress, null);
  });

  it('unlocks all medals when cheat flag is set', () => {
    const medals = evaluateAllMedals([], { allMedalsUnlocked: true });
    assert.equal(medals.every((m) => m.earned), true);
    assert.equal(medals.every((m) => m.earnedAt), true);
  });
});

describe('buildMedalContext', () => {
  it('aggregates monthly calories', () => {
    const ctx = buildMedalContext([
      session('1', '2025-07-01', { activeKcal: 6000 }),
      session('2', '2025-07-15', { activeKcal: 5000 }),
    ]);
    assert.ok(ctx.monthsWith10kCal.includes('2025-07'));
  });
});

describe('getNewlyEarnedMedals', () => {
  it('returns medals earned only after the new session', () => {
    const before = [];
    const after = [session('1', '2025-06-10', { distanceM: 500 })];
    const newly = getNewlyEarnedMedals(before, after);
    assert.equal(newly.length, 1);
    assert.equal(newly[0].id, 'first_splash');
  });

  it('returns empty when no new medals', () => {
    const sessions = [session('1', '2025-06-10', { distanceM: 500 })];
    assert.deepEqual(getNewlyEarnedMedals(sessions, sessions), []);
  });
});

describe('earnedAt', () => {
  it('records the date of the session that unlocked the medal', () => {
    const sessions = [
      session('1', '2025-06-08', { distanceM: 500 }),
      session('2', '2025-06-10', { distanceM: 500 }),
    ];
    const medals = evaluateAllMedals(sessions);
    const first = medals.find((m) => m.id === 'first_splash');
    assert.equal(first.earnedAt, '2025-06-08');
  });

  it('uses the session that completes a streak requirement', () => {
    const sessions = [
      session('1', '2025-06-10', { distanceM: 1000 }),
      session('2', '2025-06-11', { distanceM: 1000 }),
      session('3', '2025-06-12', { distanceM: 1000 }),
    ];
    const medals = evaluateAllMedals(sessions);
    assert.equal(medals.find((m) => m.id === 'hat_trick').earnedAt, '2025-06-12');
  });
});
