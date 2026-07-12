import { evaluateMonthlyChallenges, getMonthKey } from './swimMonthlyChallenges.js';
import { formatChallengeTarget } from './monthlyChallengeFormatters.js';
import { resolveMascotId, getMascotGameplay } from './mascotConstants.js';
import { daysSinceLastSession } from './swimLaunchSync.js';

export const DAYS_BEFORE_MONTH_END_TO_REMIND = 5;
export const UPLOAD_REMINDER_MIN_DAYS = 7;

const notificationStorageKey = 'AUDIT_SWIM_NOTIFICATIONS';

export const getDaysRemainingInMonth = (date = new Date()) => {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return Math.max(0, lastDay.getDate() - date.getDate());
};

export const isNearMonthEnd = (date = new Date(), daysBeforeEnd = DAYS_BEFORE_MONTH_END_TO_REMIND) =>
  getDaysRemainingInMonth(date) <= daysBeforeEnd;

const makeTr = (t) => (key, params = {}) => {
  let str = typeof t === 'function' ? t(key) : key;
  Object.entries(params).forEach(([k, v]) => {
    str = str.replaceAll(`{${k}}`, v != null && v !== '' ? String(v) : '—');
  });
  return str.replace(/\{[a-zA-Z]+\}/g, '—');
};

/** Build in-app / push reminder payloads for open monthly goals near month end. */
export const getMonthlyGoalReminders = (
  sessions,
  profile,
  t,
  { monthlyChallengeRerolls = {}, now = new Date() } = {}
) => {
  if (!isNearMonthEnd(now)) return [];

  const monthKey = getMonthKey(now);
  const mascotId = resolveMascotId(profile, { sessions, monthlyChallengeRerolls });
  const intensity = getMascotGameplay(mascotId).challengeIntensity;
  const state = evaluateMonthlyChallenges(sessions, monthKey, monthlyChallengeRerolls, intensity);
  const open = state.challenges.filter((c) => !c.completed);
  if (!open.length || state.completedCount >= 3) return [];

  const tr = makeTr(t);
  const daysLeft = getDaysRemainingInMonth(now);
  const openSummary = open
    .slice(0, 2)
    .map((c) => formatChallengeTarget(c.type, c.target, t))
    .join(', ');

  return [{
    id: `monthly-goals-${monthKey}`,
    type: 'monthlyGoals',
    title: tr('notifications.monthlyGoalsTitle'),
    body: tr('notifications.monthlyGoalsBody', {
      count: open.length,
      days: daysLeft,
      goals: openSummary,
    }),
    monthKey,
    openCount: open.length,
  }];
};

/** Remind web users to upload when no session has been logged recently. */
export const getUploadSyncReminder = (sessions, t, { now = new Date(), minDays = UPLOAD_REMINDER_MIN_DAYS } = {}) => {
  const days = daysSinceLastSession(sessions, now);
  if (days == null || days < minDays) return null;

  const tr = makeTr(t);
  return {
    id: 'upload-sync',
    type: 'uploadSync',
    title: tr('notifications.uploadSyncTitle'),
    body: tr('notifications.uploadSyncBody', { days }),
    daysSinceLast: days,
  };
};

export const collectLaunchReminders = (
  sessions,
  profile,
  t,
  options = {}
) => {
  const reminders = [...getMonthlyGoalReminders(sessions, profile, t, options)];
  const upload = getUploadSyncReminder(sessions, t, options);
  if (upload) reminders.push(upload);
  return reminders;
};

const readDismissed = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(notificationStorageKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const dismissReminder = (id) => {
  if (typeof window === 'undefined') return;
  const dismissed = readDismissed();
  dismissed[id] = new Date().toISOString();
  localStorage.setItem(notificationStorageKey, JSON.stringify(dismissed));
};

export const filterUndismissedReminders = (reminders, { now = new Date() } = {}) => {
  const dismissed = readDismissed();
  return reminders.filter((r) => {
    const at = dismissed[r.id];
    if (!at) return true;
    const dismissedAt = new Date(at);
    if (Number.isNaN(dismissedAt.getTime())) return true;
    // Monthly goal reminders can reappear each day in the final week.
    if (r.type === 'monthlyGoals') {
      return now.toDateString() !== dismissedAt.toDateString();
    }
    // Upload reminder: re-show after 3 days.
    const days = Math.round((now - dismissedAt) / 86400000);
    return days >= 3;
  });
};

export const showBrowserNotification = async (reminder) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'denied') return false;
  if (Notification.permission === 'default') {
    const result = await Notification.requestPermission();
    if (result !== 'granted') return false;
  }
  try {
    new Notification(reminder.title, { body: reminder.body, tag: reminder.id });
    return true;
  } catch {
    return false;
  }
};
