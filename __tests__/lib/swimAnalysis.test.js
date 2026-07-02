import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildPersonalFeedback } from '../../lib/swimAnalysis.js';

const t = (key) => key;

const session = (id, date, metrics) => ({ id, date, metrics });

describe('buildPersonalFeedback', () => {
  it('returns rich first-session feedback without AI', () => {
    const feedback = buildPersonalFeedback(
      session('1', '2025-06-10', { distanceM: 2000, paceSecPer100m: 120, activeKcal: 400 }),
      [session('1', '2025-06-10', { distanceM: 2000, paceSecPer100m: 120, activeKcal: 400 })],
      t,
      { sex: 'male', age: 30 }
    );

    assert.equal(feedback.isFirst, true);
    assert.ok(feedback.coachMessage.includes('feedback.firstSession'));
    assert.ok(feedback.tip);
    assert.ok(feedback.highlights.length >= 2);
  });

  it('includes benchmark and trend insights for repeat swimmers', () => {
    const sessions = [
      session('1', '2025-06-01', { distanceM: 2000, paceSecPer100m: 130 }),
      session('2', '2025-06-05', { distanceM: 2200, paceSecPer100m: 128 }),
      session('3', '2025-06-10', { distanceM: 2500, paceSecPer100m: 118, activeKcal: 500, avgHeartRate: 142 }),
    ];
    const feedback = buildPersonalFeedback(sessions[2], sessions, t, { sex: 'male', age: 30 });

    assert.equal(feedback.isFirst, false);
    assert.ok(feedback.insights.length >= 4);
    assert.ok(feedback.highlights.some((h) => h.label === 'feedback.highlightPace'));
    assert.ok(feedback.benchmarkLevel);
    assert.ok(feedback.tip);
    assert.ok(feedback.coachMessage.length > 0);
    assert.ok(feedback.motivation.length > 0);
  });

  it('detects personal best badges in motivation', () => {
    const sessions = [
      session('1', '2025-06-01', { distanceM: 2000, paceSecPer100m: 130 }),
      session('2', '2025-06-10', { distanceM: 2500, paceSecPer100m: 110 }),
    ];
    const feedback = buildPersonalFeedback(sessions[1], sessions, t, { sex: 'female', age: 28 });

    assert.ok(feedback.badges.length > 0);
    assert.equal(feedback.motivation, 'feedback.motivationPersonalBest');
  });
});
