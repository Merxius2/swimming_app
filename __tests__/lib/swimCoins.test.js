import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSessionCoins,
  calculateUploadCoins,
  medalTierCoins,
  monthlyTierCoinDelta,
  migrateSessionCoins,
} from '../../lib/swimCoins.js';

const session = (date, metrics) => ({ id: date, date, metrics });

describe('swimCoins', () => {
  it('rewards longer and harder sessions', () => {
    const short = calculateSessionCoins(session('2025-06-01', { distanceM: 500, durationSec: 600, activeKcal: 100 }), []);
    const long = calculateSessionCoins(session('2025-06-02', { distanceM: 4000, durationSec: 3600, activeKcal: 700 }), []);
    assert.ok(long > short);
  });

  it('bonuses faster pace vs prior average', () => {
    const prior = [session('2025-05-01', { paceSecPer100m: 140 })];
    const faster = calculateSessionCoins(session('2025-06-01', { paceSecPer100m: 120, distanceM: 2000 }), prior);
    const slower = calculateSessionCoins(session('2025-06-02', { paceSecPer100m: 150, distanceM: 2000 }), prior);
    assert.ok(faster > slower);
  });

  it('combines session, medal and monthly coins on upload', () => {
    const breakdown = calculateUploadCoins({
      session: session('2025-06-01', { distanceM: 3000, durationSec: 2400, activeKcal: 500 }),
      sessionsBefore: [],
      newMedals: [{ id: 'ten_sessions', tier: 'bronze' }],
      monthlyUpgrade: { tier: 'silver', fromTier: 'bronze' },
    });
    assert.equal(breakdown.medalCoins, medalTierCoins('bronze'));
    assert.equal(breakdown.monthlyCoins, monthlyTierCoinDelta('bronze', 'silver'));
    assert.equal(breakdown.total, breakdown.sessionCoins + breakdown.medalCoins + breakdown.monthlyCoins);
  });

  it('migrates legacy sessions with coinsEarned', () => {
    const migrated = migrateSessionCoins([
      session('2025-06-01', { distanceM: 2500, durationSec: 1800, activeKcal: 400 }),
    ]);
    assert.ok(migrated[0].coinsEarned >= 5);
  });
});
