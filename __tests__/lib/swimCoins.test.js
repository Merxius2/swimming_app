import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSessionCoins,
  calculateSessionCoinBreakdown,
  calculateUploadCoins,
  medalTierCoins,
  monthlyTierCoinDelta,
  migrateSessionCoins,
  migrateCoinBonuses,
  reconcileTotalCoins,
  sumSessionCoins,
} from '../../lib/swimCoins.js';
import { sessionTotalCoins } from '../../lib/swimCoinClaims.js';

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
    assert.ok(breakdown.sessionLines.length > 0);
    assert.equal(breakdown.bonusLines.length, 2);
  });

  it('returns session line items that explain the reward', () => {
    const { sessionCoins, lines } = calculateSessionCoinBreakdown(
      session('2025-06-01', { distanceM: 3000, durationSec: 3600, activeKcal: 500, paceSecPer100m: 120 }),
      [session('2025-05-01', { paceSecPer100m: 140 })]
    );
    const lineSum = lines.reduce((sum, line) => sum + line.coins, 0);
    assert.equal(sessionCoins, lineSum);
    assert.ok(lines.some((line) => line.type === 'longDistance3k'));
    assert.ok(lines.some((line) => line.type === 'paceImprovement'));
  });

  it('migrates legacy sessions with coinsEarned', () => {
    const migrated = migrateSessionCoins([
      session('2025-06-01', { distanceM: 2500, durationSec: 1800, activeKcal: 400 }),
    ]);
    assert.ok(migrated[0].coinsEarned >= 5);
  });

  it('blocks coins when workout was previously claimed', () => {
    const pending = session('2025-06-01', { distanceM: 3000, durationSec: 2400, activeKcal: 500 });
    const claims = [{
      date: pending.date,
      metrics: {
        distanceM: pending.metrics.distanceM,
        durationSec: pending.metrics.durationSec,
        paceSecPer100m: null,
        timeRange: '',
      },
    }];
    const breakdown = calculateUploadCoins({
      session: pending,
      sessionsBefore: [],
      newMedals: [{ id: 'ten_sessions', tier: 'bronze' }],
      spentCoinClaims: claims,
    });
    assert.equal(breakdown.total, 0);
    assert.equal(breakdown.alreadyClaimed, true);
  });

  it('sumSessionCoins includes session and medal bonuses', () => {
    const total = sumSessionCoins([
      { coinsEarned: 20, coinBonus: 25 },
      { coinsEarned: 15, coinBonus: 60 },
    ]);
    assert.equal(total, sessionTotalCoins({ coinsEarned: 20, coinBonus: 25 })
      + sessionTotalCoins({ coinsEarned: 15, coinBonus: 60 }));
  });

  it('reconcileTotalCoins restores wallet when stored total was too low', () => {
    const sessions = [{ coinsEarned: 20, coinBonus: 649 }];
    assert.equal(reconcileTotalCoins(sessions, 67), 669);
    assert.equal(reconcileTotalCoins(sessions, 669), 669);
  });

  it('migrateCoinBonuses backfills medal bonuses on legacy sessions', () => {
    const sessions = migrateCoinBonuses([
      { id: '1', date: '2025-01-01', metrics: { distanceM: 1000, durationSec: 900 }, coinsEarned: 15 },
      { id: '2', date: '2025-02-01', metrics: { distanceM: 1000, durationSec: 900 }, coinsEarned: 15 },
      { id: '3', date: '2025-03-01', metrics: { distanceM: 1000, durationSec: 900 }, coinsEarned: 15 },
      { id: '4', date: '2025-04-01', metrics: { distanceM: 1000, durationSec: 900 }, coinsEarned: 15 },
      { id: '5', date: '2025-05-01', metrics: { distanceM: 1000, durationSec: 900 }, coinsEarned: 15 },
      { id: '6', date: '2025-06-01', metrics: { distanceM: 1000, durationSec: 900 }, coinsEarned: 15 },
      { id: '7', date: '2025-07-01', metrics: { distanceM: 1000, durationSec: 900 }, coinsEarned: 15 },
      { id: '8', date: '2025-08-01', metrics: { distanceM: 1000, durationSec: 900 }, coinsEarned: 15 },
      { id: '9', date: '2025-09-01', metrics: { distanceM: 1000, durationSec: 900 }, coinsEarned: 15 },
      { id: '10', date: '2025-10-01', metrics: { distanceM: 1000, durationSec: 900 }, coinsEarned: 15 },
    ]);
    const tenth = sessions.find((s) => s.id === '10');
    assert.ok(tenth.coinBonus >= medalTierCoins('silver'));
    assert.ok(sumSessionCoins(sessions) > 15 * 10);
  });
});
