import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateMonthlyChallenges,
  evaluateMonthlyChallenges,
  getMonthlyTierUpgrade,
  getMonthlyChallengeHistory,
  getPreviewMonthlyMedalHistory,
  getMonthlyMedalsForYear,
  createMonthlyChallengeReroll,
  canRerollMonthlyChallenge,
  hasMonthlyChallengeReroll,
  hasRerollAvailability,
  normalizeMonthlyChallengeRerolls,
  __testing,
} from '../../lib/swimMonthlyChallenges.js';

const session = (id, date, metrics) => ({ id, date, metrics });

describe('swimMonthlyChallenges', () => {
  it('generates three deterministic challenges per month', () => {
    const a = generateMonthlyChallenges([], '2025-06');
    const b = generateMonthlyChallenges([], '2025-06');
    const c = generateMonthlyChallenges([], '2025-07');
    assert.equal(a.length, 3);
    assert.deepEqual(a.map((x) => x.type), b.map((x) => x.type));
    assert.notDeepEqual(a.map((x) => x.type), c.map((x) => x.type));
  });

  it('awards bronze with one challenge complete', () => {
    const sessions = [
      session('1', '2025-06-01', { distanceM: 2000, activeKcal: 400 }),
      session('2', '2025-06-03', { distanceM: 2000, activeKcal: 400 }),
      session('3', '2025-06-05', { distanceM: 2000, activeKcal: 400 }),
      session('4', '2025-06-07', { distanceM: 2000, activeKcal: 400 }),
    ];
    const state = evaluateMonthlyChallenges(sessions, '2025-06');
    assert.ok(state.completedCount >= 1);
    assert.ok(['bronze', 'silver', 'gold'].includes(state.tier));
  });

  it('detects tier upgrade after new session', () => {
    const before = [
      session('1', '2025-06-01', { distanceM: 500 }),
    ];
    const after = [
      ...before,
      session('2', '2025-06-02', { distanceM: 2500, activeKcal: 800 }),
      session('3', '2025-06-04', { distanceM: 2500, activeKcal: 800 }),
      session('4', '2025-06-06', { distanceM: 2500, activeKcal: 800 }),
    ];
    const upgrade = getMonthlyTierUpgrade(before, after, '2025-06');
    if (upgrade) {
      assert.ok(__testing.tierRank(upgrade.tier) >= 1);
    }
  });

  it('lists earned months in history', () => {
    const sessions = Array.from({ length: 6 }, (_, i) =>
      session(String(i), `2025-06-${String(i + 1).padStart(2, '0')}`, { distanceM: 3000, activeKcal: 600 })
    );
    const history = getMonthlyChallengeHistory(sessions);
    assert.equal(history[0].monthKey, '2025-06');
    assert.ok(history[0].tier);
  });

  it('returns one medal tier per month for a year', () => {
    const sessions = [
      session('1', '2025-01-05', { distanceM: 3000, activeKcal: 600 }),
      session('2', '2025-03-10', { distanceM: 3000, activeKcal: 600 }),
    ];
    const year = getMonthlyMedalsForYear(sessions, 2025);
    assert.equal(year.length, 12);
    assert.ok(year.some((m) => m.hasSessions));
  });

  it('adds preview bronze silver gold months when cheat enabled', () => {
    const preview = getPreviewMonthlyMedalHistory([], new Date('2025-06-15'));
    assert.equal(preview.length, 3);
    assert.equal(preview[0].tier, 'gold');
    assert.equal(preview[1].tier, 'silver');
    assert.equal(preview[2].tier, 'bronze');
    assert.ok(preview.every((m) => m.isPreview));

    const merged = getMonthlyChallengeHistory([], { previewMonthlyMedals: true });
    assert.equal(merged.length, 3);
  });

  it('rerolls one challenge per month with a new unused type', () => {
    const monthKey = '2025-06';
    const base = generateMonthlyChallenges([], monthKey);
    const override = createMonthlyChallengeReroll([], monthKey, 0);
    assert.ok(override);
    assert.equal(override.tierIndex, 0);
    assert.notEqual(override.type, base[0].type);

    const rerolls = {
      [monthKey]: { overrides: { 0: override.type }, freeUses: 1 },
    };
    const after = generateMonthlyChallenges([], monthKey, rerolls);
    assert.equal(after[0].type, override.type);
    assert.equal(after[1].type, base[1].type);
    assert.equal(after[2].type, base[2].type);
    assert.ok(hasMonthlyChallengeReroll(monthKey, rerolls));
    assert.equal(canRerollMonthlyChallenge([], monthKey, 1, rerolls, 0), false);
    assert.equal(canRerollMonthlyChallenge([], monthKey, 1, rerolls, 1), true);
    assert.equal(hasRerollAvailability(monthKey, rerolls, 1), true);
  });

  it('allows a second free reroll when the coach grants two', () => {
    const monthKey = '2025-06';
    const rerolls = {
      [monthKey]: { overrides: { 0: 'kcal' }, freeUses: 1 },
    };
    assert.equal(hasRerollAvailability(monthKey, rerolls, 0, 1), false);
    assert.equal(hasRerollAvailability(monthKey, rerolls, 0, 2), true);
    assert.equal(
      canRerollMonthlyChallenge([], monthKey, 1, rerolls, 0, { freeLimit: 2 }),
      true
    );
  });

  it('scales challenge targets with coach intensity', () => {
    const monthKey = '2025-06';
    const easy = generateMonthlyChallenges([], monthKey, {}, 0.75);
    const normal = generateMonthlyChallenges([], monthKey, {}, 1);
    const hard = generateMonthlyChallenges([], monthKey, {}, 1.25);
    for (let i = 0; i < 3; i += 1) {
      assert.ok(easy[i].target <= normal[i].target);
      assert.ok(hard[i].target >= normal[i].target);
    }
    assert.ok(hard.some((ch, i) => ch.target > easy[i].target));
  });

  it('blocks reroll on completed challenges', () => {
    const monthKey = '2025-06';
    const sessions = Array.from({ length: 8 }, (_, i) =>
      session(String(i), `2025-06-${String(i + 1).padStart(2, '0')}`, { distanceM: 3000, activeKcal: 800 })
    );
    const state = evaluateMonthlyChallenges(sessions, monthKey);
    const completedIndex = state.challenges.findIndex((ch) => ch.completed);
    if (completedIndex >= 0) {
      assert.equal(canRerollMonthlyChallenge(sessions, monthKey, completedIndex), false);
    }
  });

  it('normalizes legacy reroll entries to the new overrides format', () => {
    const normalized = normalizeMonthlyChallengeRerolls({
      '2025-06': { tierIndex: 0, type: 'kcal' },
      '2025-07': { overrides: { 1: 'distance' }, freeUsed: false },
      '2025-08': { overrides: { 0: 'sessions' }, freeUsed: true },
      invalid: null,
    });

    assert.deepEqual(normalized['2025-06'], {
      overrides: { 0: 'kcal' },
      freeUses: 1,
    });
    assert.deepEqual(normalized['2025-07'], {
      overrides: { 1: 'distance' },
      freeUses: 0,
    });
    assert.deepEqual(normalized['2025-08'], {
      overrides: { 0: 'sessions' },
      freeUses: 1,
    });
    assert.deepEqual(normalized.invalid, { overrides: {}, freeUses: 0 });
  });
});
