import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  canSwitchMascot,
  countMonthlyMedals,
  getMascotUnlockStatus,
  getUserSwimPaceLevel,
  isMascotUnlocked,
  resolveUnlockedMascotId,
} from '../../lib/mascotUnlock.js';

const profile = { sex: 'male', age: 30, mascotId: 'flip' };

const makeSession = (date, paceSecPer100m, extra = {}) => ({
  id: `s-${date}`,
  date,
  metrics: {
    paceSecPer100m,
    distanceM: 3000,
    activeKcal: 600,
    durationSec: 1200,
    ...extra,
  },
});

describe('mascotUnlock', () => {
  it('unlocks Flip from the start', () => {
    assert.equal(isMascotUnlocked('flip', { profile, sessions: [] }), true);
  });

  it('locks Flo without intermediate pace or enough monthly medals', () => {
    const sessions = [makeSession('2025-06-01', 170)];
    const status = getMascotUnlockStatus('flo', { profile, sessions });
    assert.equal(status.unlocked, false);
    assert.equal(status.paceLevel, 'developing');
  });

  it('unlocks Flo with intermediate pace', () => {
    const sessions = [makeSession('2025-06-01', 128)];
    assert.equal(isMascotUnlocked('flo', { profile, sessions }), true);
  });

  it('unlocks Flo with five monthly medals', () => {
    const sessions = [];
    for (let month = 1; month <= 5; month += 1) {
      const monthKey = String(month).padStart(2, '0');
      for (let day = 1; day <= 6; day += 1) {
        sessions.push(makeSession(`2025-${monthKey}-${String(day).padStart(2, '0')}`, 170));
      }
    }
    assert.equal(countMonthlyMedals(sessions), 5);
    assert.equal(isMascotUnlocked('flo', { profile, sessions }), true);
  });

  it('unlocks Fins with advanced pace', () => {
    const sessions = [makeSession('2025-06-01', 100)];
    assert.equal(isMascotUnlocked('fins', { profile, sessions }), true);
  });

  it('resolves to Flip when requested mascot is locked', () => {
    const lockedProfile = { sex: 'female', age: 30, mascotId: 'flo' };
    assert.equal(resolveUnlockedMascotId(lockedProfile, { profile: lockedProfile, sessions: [] }), 'flip');
  });

  it('allows mascot switch before first session of the month', () => {
    const result = canSwitchMascot({
      profile: { ...profile, mascotSwitchMonthKey: null },
      sessions: [makeSession('2025-05-20', 128)],
      monthKey: '2025-06',
      currentMascotId: 'flip',
      nextMascotId: 'flo',
    });
    assert.equal(result.allowed, true);
  });

  it('blocks mascot switch after first session of the month', () => {
    const unlockedProfile = { ...profile, mascotSwitchMonthKey: null };
    const result = canSwitchMascot({
      profile: unlockedProfile,
      sessions: [makeSession('2025-06-02', 128)],
      monthKey: '2025-06',
      currentMascotId: 'flip',
      nextMascotId: 'flo',
    });
    assert.equal(result.allowed, false);
    assert.equal(result.reason, 'afterFirstSession');
  });

  it('blocks a second mascot switch in the same month', () => {
    const result = canSwitchMascot({
      profile: { ...profile, mascotId: 'flo', mascotSwitchMonthKey: '2025-06' },
      sessions: [],
      monthKey: '2025-06',
      currentMascotId: 'flo',
      nextMascotId: 'flip',
    });
    assert.equal(result.allowed, false);
    assert.equal(result.reason, 'alreadySwitched');
  });

  it('derives user pace level from average pace', () => {
    const sessions = [
      makeSession('2025-06-01', 140),
      makeSession('2025-06-08', 120),
    ];
    assert.equal(getUserSwimPaceLevel(profile, sessions), 'intermediate');
  });
});
