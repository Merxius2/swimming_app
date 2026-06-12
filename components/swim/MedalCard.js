import { useLanguage } from '../../context/UserPreferencesContext';
import { formatDistance, formatPace, formatDuration, formatDateLong } from '../../lib/swimFormatters';
import { medalTierCoins } from '../../lib/swimCoins';
import MedalIcon from './MedalIcon';
import CoinBadge from './CoinBadge';

const EARNED_TIER_CLASS = {
  bronze: 'medal-card-earned-bronze',
  silver: 'medal-card-earned-silver',
  gold: 'medal-card-earned-gold',
};

const formatValue = (kind, value, t) => {
  if (value == null) return '—';
  switch (kind) {
    case 'sessions':
      return String(value);
    case 'distance':
      return formatDistance(value);
    case 'duration':
      return formatDuration(value);
    case 'kcal':
      return `${value.toLocaleString()} ${t('common.kcal')}`;
    case 'pace':
      return formatPace(value);
    default:
      return String(value);
  }
};

const formatPeriodShort = (period, t) => {
  if (!period) return '';
  if (/^\d{4}-\d{2}$/.test(period)) {
    const [y, m] = period.split('-');
    return new Date(parseInt(y, 10), parseInt(m, 10) - 1).toLocaleDateString(undefined, {
      month: 'short',
      year: 'numeric',
    });
  }
  const [season, year] = period.split('-');
  return `${t(`medals.seasons.${season}`)} ${year}`;
};

export default function MedalCard({ medal, periodLabel }) {
  const { t, language } = useLanguage();
  const { id, tier, earned, periods, progress, earnedAt } = medal;

  const locale = language === 'nl' ? 'nl-NL' : language === 'ru' ? 'ru-RU' : language === 'tr' ? 'tr-TR' : 'en-US';

  const tr = (key, params) => {
    let str = t(key);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v));
      });
    }
    return str;
  };

  const coinValue = medalTierCoins(tier);
  const showProgress = !earned && progress && progress.percent != null;
  const earnedTierClass = EARNED_TIER_CLASS[tier] || EARNED_TIER_CLASS.bronze;

  const progressLabel = showProgress
    ? tr('medals.progress.summary', {
        current: formatValue(progress.kind, progress.current, t),
        target: formatValue(progress.kind, progress.target, t),
      })
    : '';

  const tooltipLines = [];
  if (showProgress) {
    tooltipLines.push(tr(`medals.progress.scope.${progress.scope}`));
    tooltipLines.push(progressLabel);
    if (progress.percent > 0) {
      tooltipLines.push(tr('medals.progress.percentComplete', { percent: progress.percent }));
    }
    if (progress.best != null && progress.best > 0 && progress.best > (progress.current ?? 0)) {
      tooltipLines.push(
        tr('medals.progress.alsoBest', {
          detail: `${formatValue(progress.kind, progress.best, t)}${
            progress.bestPeriod ? ` (${formatPeriodShort(progress.bestPeriod, t)})` : ''
          }`,
        })
      );
    }
    if (progress.kind === 'pace' && progress.current == null) {
      tooltipLines.push(t('medals.progress.noPaceYet'));
    }
  }

  return (
    <div
      className={`group relative medal-card card p-4 transition ${
        earned
          ? `medal-card-earned ${earnedTierClass}`
          : 'medal-card-locked'
      }`}
    >
      {earned && (
        <>
          <div className="medal-card-shine" aria-hidden="true" />
          <span className="medal-card-earned-badge">{t('medals.earned')}</span>
        </>
      )}

      {showProgress && tooltipLines.length > 0 && (
        <div
          role="tooltip"
          className="pointer-events-none absolute left-1/2 bottom-full z-20 mb-2 w-[min(240px,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-xs text-ink-soft shadow-lg opacity-0 translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0"
        >
          {tooltipLines.map((line, i) => (
            <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
          ))}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-gray-900" />
        </div>
      )}

      <div
        tabIndex={showProgress ? 0 : undefined}
        className={`relative z-[2] flex items-start gap-3 outline-none ${showProgress ? 'cursor-help' : ''} ${earned ? 'pt-5' : ''}`}
      >
        <MedalIcon id={id} tier={tier} size={48} locked={!earned} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className={`font-semibold text-sm leading-snug ${earned ? 'text-ink dark:text-gray-100' : 'text-ink-soft dark:text-gray-300'}`}>
              {t(`medals.items.${id}.title`)}
            </p>
            {coinValue > 0 && (
              <CoinBadge
                amount={coinValue}
                size="sm"
                className={`shrink-0 ${earned ? '' : 'opacity-60'}`}
              />
            )}
          </div>
          <p className={`text-xs mt-1 leading-relaxed ${earned ? 'text-ink-soft' : 'text-ink-faint'}`}>
            {t(`medals.items.${id}.desc`)}
          </p>

          {showProgress && (
            <div className="mt-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] text-ink-faint truncate">{progressLabel}</span>
                <span className="text-[10px] font-medium text-brand shrink-0">{progress.percent}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand to-[#7B5BFF] transition-all duration-300"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}

          {earned && earnedAt && (
            <p className="text-[10px] text-brand mt-2 font-medium">
              {tr('medals.earnedOn', { date: formatDateLong(earnedAt, locale) })}
            </p>
          )}

          {earned && periods?.length > 0 && (
            <p className="text-[10px] text-ink-faint mt-1">
              {periodLabel ? periodLabel(periods) : periods.join(', ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
