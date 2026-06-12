import { useLanguage } from '../../context/UserPreferencesContext';
import { formatDateLong } from '../../lib/swimFormatters';
import {
  formatChallengeTarget,
  formatChallengeValue,
  tr,
} from '../../lib/monthlyChallengeFormatters';
import MonthlyMedalIcon from './MonthlyMedalIcon';
import CoinBadge from './CoinBadge';
import { monthlyTierCoins } from '../../lib/swimCoins';

/**
 * Monthly medal with hover tooltip showing tier and challenge breakdown.
 */
export default function MonthlyMedalTile({
  monthKey,
  tier = null,
  completedCount = 0,
  challenges = [],
  earnedAt = null,
  hasSessions = false,
  isPreview = false,
  size = 40,
  compact = false,
}) {
  const { t, language } = useLanguage();
  const locale = language === 'nl' ? 'nl-NL' : language === 'ru' ? 'ru-RU' : language === 'tr' ? 'tr-TR' : 'en-US';

  const monthShort = new Date(`${monthKey}-01`).toLocaleDateString(locale, { month: 'short' });
  const monthLong = new Date(`${monthKey}-01`).toLocaleDateString(locale, { month: 'long', year: 'numeric' });

  const showTooltip = challenges.length > 0;

  return (
    <div
      className={`group relative flex flex-col items-center gap-1.5 text-center ${
        compact ? 'card p-2' : ''
      } ${tier ? '' : compact ? 'opacity-60' : ''}`}
    >
      {showTooltip && (
        <div
          role="tooltip"
          className="pointer-events-none absolute left-1/2 bottom-full z-30 mb-2 w-[min(260px,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-left text-xs text-ink-soft shadow-lg opacity-0 translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0"
        >
          <div>
            {isPreview && (
              <p className="text-[10px] uppercase tracking-wide text-amber-600 dark:text-amber-400 font-semibold mb-1">
                {t('monthlyChallenges.previewLabel')}
              </p>
            )}
            {tier ? (
              <>
                <p className="font-semibold text-ink leading-snug">
                  {tr(t, 'monthlyChallenges.tooltip.tierEarned', {
                    tier: t(`monthlyChallenges.tiers.${tier}`),
                    month: monthLong,
                  })}
                </p>
                <p className="mt-1 leading-snug">
                  {tr(t, 'monthlyChallenges.tooltip.challengesCompleted', { count: completedCount })}
                </p>
                {earnedAt && (
                  <p className="mt-1 text-brand font-medium leading-snug">
                    {tr(t, 'monthlyChallenges.tooltip.earnedOn', {
                      date: formatDateLong(earnedAt, locale),
                    })}
                  </p>
                )}
              </>
            ) : hasSessions ? (
              <p className="font-semibold text-ink leading-snug">
                {tr(t, 'monthlyChallenges.tooltip.inProgress', { count: completedCount })}
              </p>
            ) : (
              <p className="leading-snug">{t('monthlyChallenges.tooltip.noActivity')}</p>
            )}
          </div>

          {challenges.length > 0 && (
            <ul className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
              {challenges.map((ch) => (
                <li key={ch.id}>
                  <p className={`font-medium leading-snug ${ch.completed ? 'text-green-600 dark:text-green-400' : 'text-ink'}`}>
                    {tr(t, 'monthlyChallenges.tooltip.challengeLine', {
                      type: t(`monthlyChallenges.types.${ch.type}`),
                      current: formatChallengeValue(ch.type, ch.current, t),
                      target: formatChallengeValue(ch.type, ch.target, t),
                    })}
                    {ch.completed && (
                      <span className="ml-1 text-[10px] uppercase font-semibold">
                        · {t('monthlyChallenges.done')}
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-ink-faint mt-0.5 leading-snug">
                    {formatChallengeTarget(ch.type, ch.target, t)}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-gray-900" />
        </div>
      )}

      <div
        tabIndex={showTooltip ? 0 : undefined}
        className={`outline-none ${showTooltip ? 'cursor-help' : ''}`}
        aria-label={tier
          ? tr(t, 'monthlyChallenges.tooltip.tierEarned', {
              tier: t(`monthlyChallenges.tiers.${tier}`),
              month: monthLong,
            })
          : monthLong}
      >
        <MonthlyMedalIcon tier={tier} size={size} muted={!tier} />
      </div>

      {compact && (
        <>
          <p className="text-[10px] font-medium text-ink leading-tight">{monthShort}</p>
          {tier ? (
            <>
              <p className="text-[9px] text-brand font-semibold capitalize leading-tight">
                {t(`monthlyChallenges.tiers.${tier}`)}
              </p>
              <CoinBadge amount={monthlyTierCoins(tier)} size="sm" className="mt-0.5" />
            </>
          ) : hasSessions ? (
            <p className="text-[9px] text-ink-faint leading-tight">{t('monthlyChallenges.inProgress')}</p>
          ) : (
            <p className="text-[9px] text-ink-faint leading-tight">—</p>
          )}
        </>
      )}
    </div>
  );
}
