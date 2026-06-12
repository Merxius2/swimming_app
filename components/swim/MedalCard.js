import { Lock } from 'lucide-react';
import { useLanguage } from '../../context/UserPreferencesContext';
import { formatDistance, formatPace, formatDuration } from '../../lib/swimFormatters';

const TIER_STYLES = {
  bronze: 'from-amber-700 to-amber-500',
  silver: 'from-gray-400 to-gray-300',
  gold: 'from-yellow-500 to-amber-400',
};

const TIER_RING = {
  bronze: 'ring-amber-600/30',
  silver: 'ring-gray-400/30',
  gold: 'ring-yellow-500/40',
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
  const { t } = useLanguage();
  const { id, tier, earned, periods, progress } = medal;

  const tr = (key, params) => {
    let str = t(key);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v));
      });
    }
    return str;
  };

  const gradient = TIER_STYLES[tier] || TIER_STYLES.bronze;
  const ring = TIER_RING[tier] || TIER_RING.bronze;
  const showProgress = !earned && progress && progress.percent != null;

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
      className={`group relative rounded-xl border p-4 transition ${
        earned
          ? 'border-transparent bg-white dark:bg-gray-900 shadow-soft-md ring-2 ' + ring
          : 'border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80'
      }`}
    >
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
        className={`flex items-start gap-3 outline-none ${showProgress ? 'cursor-help' : ''}`}
      >
        <div
          className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner ${
            earned ? `bg-gradient-to-br ${gradient}` : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          {earned ? '🏅' : <Lock size={18} className="text-gray-400" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`font-semibold text-sm leading-snug ${earned ? 'text-ink dark:text-gray-100' : 'text-ink-soft dark:text-gray-300'}`}>
            {t(`medals.items.${id}.title`)}
          </p>
          <p className="text-xs text-ink-soft mt-1 leading-relaxed">
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

          {earned && periods?.length > 0 && (
            <p className="text-[10px] text-brand mt-2 font-medium">
              {periodLabel ? periodLabel(periods) : periods.join(', ')}
            </p>
          )}
          {earned && !periods?.length && (
            <p className="text-[10px] text-green-600 dark:text-green-400 mt-2 font-medium">
              {t('medals.earned')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
