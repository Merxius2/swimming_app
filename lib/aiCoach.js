import { formatDistance, formatPace, formatDuration } from './swimFormatters.js';
import { getCombinedStats } from './swimAnalysis.js';

const LANG_NAMES = {
  en: 'English',
  nl: 'Dutch',
  ru: 'Russian',
  tr: 'Turkish',
};

export async function fetchAiCoachFeedback({
  apiKey,
  language,
  session,
  sessions,
  profile,
  localFeedback,
}) {
  if (!apiKey?.trim()) return null;

  const combined = getCombinedStats(sessions);
  const recent = sessions.slice(-6, -1).map((s) => ({
    date: s.date,
    distanceM: s.metrics?.distanceM,
    paceSecPer100m: s.metrics?.paceSecPer100m,
    activeKcal: s.metrics?.activeKcal,
  }));

  const response = await fetch('/api/swim-feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: apiKey.trim(),
      language: LANG_NAMES[language] || 'English',
      profile: { sex: profile.sex, age: profile.age },
      session: {
        date: session.date,
        metrics: session.metrics,
      },
      recentSessions: recent,
      combined,
      localInsights: localFeedback.insights,
      badges: localFeedback.badges,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'AI feedback failed');
  }

  return response.json();
}

export function formatSessionSummary(session) {
  const m = session.metrics || {};
  return [
    `Date: ${session.date}`,
    `Distance: ${formatDistance(m.distanceM)}`,
    `Duration: ${formatDuration(m.durationSec)}`,
    `Pace: ${formatPace(m.paceSecPer100m)}`,
    `Heart rate: ${m.avgHeartRate ?? '—'} bpm`,
    `Active kcal: ${m.activeKcal ?? '—'}`,
  ].join('\n');
}
