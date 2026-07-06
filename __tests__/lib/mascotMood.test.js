import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveSessionMascotMood } from '../../lib/mascotMood.js';

describe('resolveSessionMascotMood', () => {
  it('stays happy on first session or personal best', () => {
    assert.equal(resolveSessionMascotMood({ mascotId: 'fins', isFirst: true }), 'happy');
    assert.equal(resolveSessionMascotMood({ mascotId: 'fins', hasPb: true }), 'happy');
  });

  it('keeps Flip happy even on a slower swim', () => {
    assert.equal(resolveSessionMascotMood({
      mascotId: 'flip',
      paceDeltaVsPrevious: -9,
      usedPaceDownMotivation: false,
    }), 'happy');
  });

  it('shows Flo disappointed on a slower swim', () => {
    assert.equal(resolveSessionMascotMood({
      mascotId: 'flo',
      paceDeltaVsPrevious: -6,
      usedPaceDownMotivation: true,
    }), 'disappointed');
  });

  it('shows Fins disappointed on critical feedback', () => {
    assert.equal(resolveSessionMascotMood({
      mascotId: 'fins',
      paceDeltaVsPrevious: -6,
      usedCriticalCoachLine: true,
      usedPaceDownMotivation: true,
    }), 'disappointed');
  });
});
