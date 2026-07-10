import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isPositiveInsight } from '../../lib/insightPolarity.js';
import { pickVariantKey } from '../../lib/feedbackVariants.js';
import { buildPersonalFeedback } from '../../lib/swimAnalysis.js';

describe('isPositiveInsight', () => {
  it('treats slower insights as negative even though they contain "lower"', () => {
    assert.equal(isPositiveInsight('12 sec slower per 100m than last session'), false);
    assert.equal(isPositiveInsight('8 sec slower than your recent average pace'), false);
    assert.equal(isPositiveInsight('5 sec slower than the typical swimmer in your age group'), false);
  });

  it('treats faster and goal insights as positive', () => {
    assert.equal(isPositiveInsight('6 sec faster per 100m than last session'), true);
    assert.equal(isPositiveInsight('200 m over your goal'), true);
    assert.equal(isPositiveInsight('Heart rate 8 bpm lower than last time'), true);
  });
});

describe('pickVariantKey', () => {
  it('returns deterministic variant keys for the same seed', () => {
    assert.equal(pickVariantKey('feedback.welcomeBack', 3, '2025-06-10-2500'), pickVariantKey('feedback.welcomeBack', 3, '2025-06-10-2500'));
  });
});

describe('Flip positive-only insights', () => {
  const t = (key) => key;

  const session = (id, date, metrics) => ({ id, date, metrics });

  it('filters slower insights for Flip', () => {
    const sessions = [
      session('1', '2025-06-01', { distanceM: 2000, paceSecPer100m: 110 }),
      session('2', '2025-06-10', { distanceM: 2000, paceSecPer100m: 125 }),
    ];
    const feedback = buildPersonalFeedback(sessions[1], sessions, t, {
      sex: 'male',
      age: 30,
      mascotId: 'flip',
    });

    assert.ok(feedback.insights.every((insight) => isPositiveInsight(insight)));
    assert.ok(!feedback.insights.some((insight) => /slower/i.test(insight)));
  });
});
