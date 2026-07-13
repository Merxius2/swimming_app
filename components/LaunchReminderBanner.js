import { useEffect, useMemo, useState } from 'react';
import { X, Bell, Upload } from 'lucide-react';
import { useLanguage } from '../context/UserPreferencesContext';
import { useSwim } from '../context/SwimContext';
import {
  collectLaunchReminders,
  dismissReminder,
  filterUndismissedReminders,
  showBrowserNotification,
} from '../lib/swimNotifications';

export default function LaunchReminderBanner() {
  const { t, language } = useLanguage();
  const { sessions, profile, monthlyChallengeRerolls, isLoading } = useSwim();
  const [visible, setVisible] = useState([]);

  const reminders = useMemo(() => {
    if (isLoading) return [];
    return filterUndismissedReminders(
      collectLaunchReminders(sessions, profile, t, { monthlyChallengeRerolls })
    );
  }, [isLoading, sessions, profile, monthlyChallengeRerolls, language, t]);

  useEffect(() => {
    if (!reminders.length) {
      setVisible([]);
      return undefined;
    }
    setVisible(reminders);
    reminders.forEach((reminder) => {
      showBrowserNotification(reminder);
    });
    return undefined;
  }, [reminders]);

  if (!visible.length) return null;

  const handleDismiss = (id) => {
    dismissReminder(id);
    setVisible((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[9999] space-y-2 pointer-events-none">
      {visible.map((reminder) => (
        <div
          key={reminder.id}
          className="pointer-events-auto card p-4 shadow-lg border border-brand/20 flex gap-3 items-start"
          role="status"
        >
          <div className="shrink-0 mt-0.5 text-brand">
            {reminder.type === 'uploadSync' ? <Upload size={18} /> : <Bell size={18} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">{reminder.title}</p>
            <p className="text-xs text-ink-soft mt-1 leading-relaxed">{reminder.body}</p>
          </div>
          <button
            type="button"
            onClick={() => handleDismiss(reminder.id)}
            className="shrink-0 p-1 rounded-full text-ink-faint hover:text-ink hover:bg-black/[0.05]"
            aria-label={t('notifications.dismiss')}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
