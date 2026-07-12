import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getLastSessionDate,
  daysSinceLastSession,
  shouldPromptUploadSync,
  getSyncSinceDate,
} from '../../lib/swimLaunchSync.js';
import {
  getDaysRemainingInMonth,
  isNearMonthEnd,
  getMonthlyGoalReminders,
  getUploadSyncReminder,
  filterUndismissedReminders,
} from '../../lib/swimNotifications.js';

const t = (key) => key;

describe('swimLaunchSync', () => {
  it('finds the latest session date', () => {
    assert.equal(
      getLastSessionDate([
        { date: '2025-06-01' },
        { date: '2025-06-15' },
        { date: '2025-06-10' },
      ]),
      '2025-06-15'
    );
  });

  it('prompts upload when last session is older than a week', () => {
    const now = new Date('2025-06-20');
    const sessions = [{ date: '2025-06-01' }];
    assert.equal(daysSinceLastSession(sessions, now), 19);
    assert.equal(shouldPromptUploadSync(sessions, now), true);
  });

  it('syncs since day before last session', () => {
    const since = getSyncSinceDate([{ date: '2025-06-15' }], { now: new Date('2025-06-20') });
    assert.equal(since.toISOString().slice(0, 10), '2025-06-14');
  });
});

describe('swimNotifications', () => {
  it('reminds when monthly goals are open near month end', () => {
    const now = new Date('2025-06-28');
    assert.ok(isNearMonthEnd(now));
    assert.equal(getDaysRemainingInMonth(now), 2);

    const reminders = getMonthlyGoalReminders(
      [{ date: '2025-06-01', metrics: { distanceM: 1000, activeKcal: 200 } }],
      { sex: 'male', age: 30 },
      t,
      { now }
    );
    assert.ok(reminders.length >= 1);
    assert.equal(reminders[0].type, 'monthlyGoals');
  });

  it('skips monthly reminders mid-month', () => {
    const now = new Date('2025-06-10');
    const reminders = getMonthlyGoalReminders([], { sex: 'male', age: 30 }, t, { now });
    assert.equal(reminders.length, 0);
  });

  it('builds upload sync reminder after gap', () => {
    const reminder = getUploadSyncReminder(
      [{ date: '2025-06-01' }],
      t,
      { now: new Date('2025-06-20') }
    );
    assert.equal(reminder.type, 'uploadSync');
    assert.equal(reminder.daysSinceLast, 19);
  });

  it('returns all reminders when none dismissed', () => {
    const reminders = filterUndismissedReminders([
      { id: 'test-1', type: 'monthlyGoals' },
    ]);
    assert.equal(reminders.length, 1);
  });
});
