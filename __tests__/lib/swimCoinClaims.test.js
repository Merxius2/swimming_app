import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createCoinClaim,
  findSpentCoinClaim,
  sessionTotalCoins,
} from '../../lib/swimCoinClaims.js';

const session = (date, metrics, coins = {}) => ({
  id: '1',
  date,
  metrics,
  coinsEarned: coins.earned ?? 0,
  coinBonus: coins.bonus ?? 0,
});

describe('swimCoinClaims', () => {
  it('sums session and bonus coins', () => {
    assert.equal(
      sessionTotalCoins(session('2025-06-01', {}, { earned: 20, bonus: 25 })),
      45
    );
  });

  it('matches deleted session fingerprints', () => {
    const claim = createCoinClaim(session('2025-06-03', {
      durationSec: 3267,
      distanceM: 2550,
      paceSecPer100m: 130,
      timeRange: '11:07-12:01',
    }, { earned: 30 }));

    const match = findSpentCoinClaim([claim], {
      date: '2025-06-03',
      metrics: { durationSec: 3267, distanceM: 2550, paceSecPer100m: 133 },
    });

    assert.ok(match);
  });

  it('does not match different workouts', () => {
    const claim = createCoinClaim(session('2025-06-03', {
      durationSec: 3267,
      distanceM: 2550,
    }));

    assert.equal(
      findSpentCoinClaim([claim], {
        date: '2025-06-03',
        metrics: { durationSec: 3267, distanceM: 2000 },
      }),
      null
    );
  });
});
