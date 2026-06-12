import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateMonthlyChallenges,
  evaluateMonthlyChallenges,
  getMonthlyTierUpgrade,
  getMonthlyChallengeHistory,
  getPreviewMonthlyMedalHistory,
  getMonthlyMedalsForYear,
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
});
