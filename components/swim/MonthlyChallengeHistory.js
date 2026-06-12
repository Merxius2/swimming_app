import { useMemo, useState } from 'react';
import { useLanguage } from '../../context/UserPreferencesContext';
import { useSwim } from '../../context/SwimContext';
import { getMonthlyChallengeHistory } from '../../lib/swimMonthlyChallenges';
import MonthlyMedalTile from './MonthlyMedalTile';

const earnedYearsFromHistory = (history) => {
  const years = new Set(history.map((m) => parseInt(m.monthKey.slice(0, 4), 10)));
  return [...years].sort((a, b) => b - a);
};

export default function MonthlyChallengeHistory({ sessions }) {
  const { t } = useLanguage();
  const { cheats } = useSwim();
  const previewMonthlyMedals = Boolean(cheats?.previewMonthlyMedals);

  const earned = useMemo(
    () => getMonthlyChallengeHistory(sessions, { previewMonthlyMedals }),
    [sessions, previewMonthlyMedals]
  );
  const years = useMemo(() => earnedYearsFromHistory(earned), [earned]);
  const [year, setYear] = useState(() => years[0] ?? new Date().getFullYear());

  const activeYear = years.includes(year) ? year : years[0];
  const months = useMemo(
    () => earned
      .filter((m) => m.monthKey.startsWith(`${activeYear}-`))
      .sort((a, b) => b.monthKey.localeCompare(a.monthKey)),
    [earned, activeYear]
  );

  if (!earned.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-3 px-1 gap-2 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">
            {t('monthlyChallenges.historyTitle')}
          </h2>
          <p className="text-[11px] text-ink-faint mt-0.5">{t('monthlyChallenges.historySubtitle')}</p>
          {previewMonthlyMedals && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-1">
              {t('monthlyChallenges.previewActive')}
            </p>
          )}
        </div>
        {years.length > 1 && (
          <select
            value={activeYear}
            onChange={(e) => setYear(Number(e.target.value))}
            className="text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1"
            aria-label={t('monthlyChallenges.yearLabel')}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        )}
        {years.length === 1 && (
          <span className="text-xs text-ink-faint font-medium">{activeYear}</span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {months.map((entry) => (
          <MonthlyMedalTile
            key={entry.monthKey}
            monthKey={entry.monthKey}
            tier={entry.tier}
            completedCount={entry.completedCount}
            challenges={entry.challenges}
            earnedAt={entry.earnedAt}
            hasSessions
            isPreview={entry.isPreview}
            size={40}
            compact
          />
        ))}
      </div>
    </section>
  );
}
