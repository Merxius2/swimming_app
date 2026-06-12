import { useLanguage } from '../../context/UserPreferencesContext';
import { evaluateMonthlyChallenges, getMonthKey } from '../../lib/swimMonthlyChallenges';
import {
  formatChallengeTarget,
  formatChallengeValue,
  tr,
} from '../../lib/monthlyChallengeFormatters';
import MonthlyMedalTile from './MonthlyMedalTile';

const TIER_STYLES = {
  bronze: 'from-amber-700 to-amber-500 ring-amber-600/30',
  silver: 'from-gray-400 to-gray-300 ring-gray-400/30',
  gold: 'from-yellow-500 to-amber-400 ring-yellow-500/40',
};

const TIER_STEPS = ['bronze', 'silver', 'gold'];

export default function MonthlyChallengesCard({ sessions, monthKey = getMonthKey() }) {
  const { t, language } = useLanguage();
  const state = evaluateMonthlyChallenges(sessions, monthKey);

  const locale = language === 'nl' ? 'nl-NL' : language === 'ru' ? 'ru-RU' : language === 'tr' ? 'tr-TR' : 'en-US';
  const monthLabel = new Date(`${monthKey}-01`).toLocaleDateString(locale, { month: 'long', year: 'numeric' });

  const currentTierIndex = state.tier ? TIER_STEPS.indexOf(state.tier) : -1;

  return (
    <div className="card p-6">
      <div className="flex items-start gap-4 mb-4 flex-wrap">
        <div className="shrink-0 flex flex-col items-center gap-2">
          <MonthlyMedalTile
            monthKey={monthKey}
            tier={state.tier}
            completedCount={state.completedCount}
            challenges={state.challenges}
            earnedAt={state.earnedAt}
            hasSessions={state.challenges.some((c) => c.current > 0) || Boolean(state.tier)}
            size={64}
          />
          {state.tier && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-white bg-gradient-to-r ring-1 ${TIER_STYLES[state.tier]}`}>
              {t(`monthlyChallenges.tiers.${state.tier}`)}
            </span>
          )}
          <div className="flex gap-1.5 mt-1" aria-hidden="true">
            {TIER_STEPS.map((tier, i) => (
              <div
                key={tier}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i <= currentTierIndex
                    ? `bg-gradient-to-br ${TIER_STYLES[tier].split(' ').slice(0, 2).join(' ')}`
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-ink">{t('monthlyChallenges.title')}</h2>
          <p className="text-sm text-ink-soft mt-0.5 capitalize">{monthLabel}</p>
          <p className="text-xs text-ink-faint mt-1">{t('monthlyChallenges.subtitle')}</p>
        </div>
      </div>

      <ul className="space-y-3">
        {state.challenges.map((ch) => {
          const pct = ch.target > 0 ? Math.min(100, Math.round((ch.current / ch.target) * 100)) : 0;
          return (
            <li
              key={ch.id}
              className={`rounded-xl border p-3 ${ch.completed ? 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-800'}`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-medium text-ink">{t(`monthlyChallenges.types.${ch.type}`)}</p>
                {ch.completed && (
                  <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 uppercase">
                    {t('monthlyChallenges.done')}
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-soft mb-2">{formatChallengeTarget(ch.type, ch.target, t)}</p>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] text-ink-faint">
                  {tr(t, 'monthlyChallenges.progress', {
                    current: formatChallengeValue(ch.type, ch.current, t),
                    target: formatChallengeValue(ch.type, ch.target, t),
                  })}
                </span>
                <span className="text-[10px] font-medium text-brand">{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${ch.completed ? 'bg-green-500' : 'bg-gradient-to-r from-brand to-[#7B5BFF]'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-[11px] text-ink-faint mt-4 leading-relaxed">
        {t('monthlyChallenges.tierHint')}
      </p>
    </div>
  );
}
