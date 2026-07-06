import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPersonalFeedback,
  getCombinedStats,
  getChartSessions,
  getStatsSessions,
} from '../../lib/swimAnalysis.js';
import { getPersonalRecords } from '../../lib/swimRecords.js';

const t = (key) => key;

const session = (id, date, metrics, excludeFromStats = false) => ({
  id,
  date,
  metrics,
  ...(excludeFromStats ? { excludeFromStats: true } : {}),
});

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
    const feedback = buildPersonalFeedback(sessions[2], sessions, t, { sex: 'male', age: 30, mascotId: 'flo' });

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

  it('returns disappointed mood for Fins on a slower swim', () => {
    const sessions = [
      session('1', '2025-06-01', { distanceM: 2000, paceSecPer100m: 110 }),
      session('2', '2025-06-10', { distanceM: 1800, paceSecPer100m: 125 }),
    ];
    const feedback = buildPersonalFeedback(sessions[1], sessions, t, {
      sex: 'male',
      age: 30,
      mascotId: 'fins',
    });

    assert.equal(feedback.mascotMood, 'disappointed');
    assert.equal(feedback.motivation, 'feedback.motivationPaceDownCritical');
  });

  it('keeps Flip happy on a moderately slower swim', () => {
    const sessions = [
      session('1', '2025-06-01', { distanceM: 2000, paceSecPer100m: 110 }),
      session('2', '2025-06-10', { distanceM: 2000, paceSecPer100m: 120 }),
    ];
    const feedback = buildPersonalFeedback(sessions[1], sessions, t, {
      sex: 'male',
      age: 30,
      mascotId: 'flip',
    });

    assert.equal(feedback.mascotMood, 'happy');
  });
});

describe('excludeFromStats', () => {
  const sessions = [
    session('1', '2025-06-01', { distanceM: 2000, paceSecPer100m: 130, durationSec: 2600, activeKcal: 400, laps: 80 }),
    session('2', '2025-06-05', { distanceM: 1500, paceSecPer100m: 150, durationSec: 2250, activeKcal: 300, laps: 60 }, true),
    session('3', '2025-06-10', { distanceM: 2500, paceSecPer100m: 118, durationSec: 2950, activeKcal: 500, laps: 100 }),
  ];

  it('filters excluded sessions from stats helpers', () => {
    assert.equal(getStatsSessions(sessions).length, 2);
    assert.equal(getCombinedStats(sessions).sessionCount, 2);
    assert.equal(getCombinedStats(sessions).totalDistanceM, 4500);
    assert.equal(getChartSessions(sessions).length, 2);
  });

  it('ignores excluded sessions for personal records', () => {
    const records = getPersonalRecords(sessions);
    assert.equal(records.fastestPace.sessionId, '3');
    assert.equal(records.longestDistance.sessionId, '3');
  });

  it('still analyzes excluded sessions without polluting combined stats', () => {
    const feedback = buildPersonalFeedback(sessions[1], sessions, t, { sex: 'male', age: 30 });
    assert.equal(feedback.combined.sessionCount, 2);
    assert.equal(feedback.combined.totalDistanceM, 4500);
  });
});
