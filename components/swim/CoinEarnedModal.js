import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { Coins, X, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/UserPreferencesContext';
import { formatDistance, formatDuration, formatPace } from '../../lib/swimFormatters';
import CoinBadge from './CoinBadge';

const tr = (t, key, params) => {
  let str = t(key);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, String(v));
    });
  }
  return str;
};

function LineLabel({ line, t }) {
  switch (line.type) {
    case 'base':
      return t('coins.lineBase');
    case 'distance':
      return tr(t, 'coins.lineDistance', {
        amount: line.coins,
        distance: formatDistance(line.distanceM),
      });
    case 'duration':
      return tr(t, 'coins.lineDuration', {
        amount: line.coins,
        duration: formatDuration(line.durationSec),
      });
    case 'kcal':
      return tr(t, 'coins.lineKcal', {
        amount: line.coins,
        kcal: line.kcal.toLocaleString(),
      });
    case 'longDistance3k':
      return tr(t, 'coins.lineLongDistance3k', { amount: line.coins });
    case 'longDistance5k':
      return tr(t, 'coins.lineLongDistance5k', { amount: line.coins });
    case 'longDuration':
      return tr(t, 'coins.lineLongDuration', { amount: line.coins });
    case 'paceImprovement':
      return tr(t, 'coins.linePaceImprovement', {
        amount: line.coins,
        pace: formatPace(line.paceSec),
        avgPace: formatPace(line.avgPaceSec),
      });
    case 'medal':
      return tr(t, 'coins.lineMedal', {
        amount: line.coins,
        tier: t(`monthlyChallenges.tiers.${line.tier}`),
        title: t(`medals.items.${line.medalId}.title`),
      });
    case 'monthly':
      return tr(t, 'coins.lineMonthly', {
        amount: line.coins,
        from: line.fromTier ? t(`monthlyChallenges.tiers.${line.fromTier}`) : '—',
        to: t(`monthlyChallenges.tiers.${line.toTier}`),
      });
    default:
      return '';
  }
}

function BreakdownSection({ title, lines, t }) {
  if (!lines?.length) return null;

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint mb-2">{title}</p>
      <ul className="space-y-2">
        {lines.map((line, index) => (
          <li
            key={`${line.type}-${index}`}
            className="flex items-start justify-between gap-3 text-sm"
          >
            <span className="text-ink-soft leading-snug min-w-0">
              <LineLabel line={line} t={t} />
            </span>
            <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400 shrink-0">
              +{line.coins}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CoinEarnedModal({ breakdown, onClose }) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return undefined;
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [mounted]);

  if (!mounted || (!breakdown?.total && !breakdown?.alreadyClaimed)) return null;

  const alreadyClaimed = Boolean(breakdown.alreadyClaimed);

  const modal = (
    <div
      className={`fixed inset-0 z-[10001] flex items-center justify-center p-4 ${
        visible ? 'medal-celebration-backdrop-in' : 'opacity-0'
      }`}
    >
      <button
        type="button"
        className="absolute inset-0 z-0 bg-black/55 backdrop-blur-sm"
        aria-label={t('coins.close')}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="coin-earned-title"
        className={`relative z-10 w-full max-w-md rounded-2xl p-[3px] bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 shadow-2xl ${
          visible ? 'medal-celebration-panel-in' : 'scale-90 opacity-0'
        }`}
      >
        <div className="relative card p-6 shadow-2xl rounded-[14px] overflow-hidden max-h-[85vh] flex flex-col">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1 rounded-full text-ink-faint hover:text-ink hover:bg-black/[0.05]"
            aria-label={t('coins.close')}
          >
            <X size={20} />
          </button>

          <div className="text-center mb-5 relative shrink-0">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/40 mb-3 medal-celebration-trophy">
              <Coins size={36} className="text-amber-600 dark:text-amber-400" strokeWidth={2.25} />
            </div>
            <h2 id="coin-earned-title" className="text-xl font-bold text-ink">
              {alreadyClaimed ? t('coins.alreadyClaimedTitle') : t('coins.popupTitle')}
            </h2>
            <p className="text-sm text-ink-soft mt-1">
              {alreadyClaimed ? t('coins.alreadyClaimedSubtitle') : t('coins.popupSubtitle')}
            </p>
            {!alreadyClaimed && (
              <div className="mt-4 flex justify-center">
                <CoinBadge amount={breakdown.total} size="md" className="text-lg" />
              </div>
            )}
          </div>

          <div className="space-y-4 overflow-y-auto mb-5 relative flex-1 min-h-0">
            {!alreadyClaimed && (
              <>
                <BreakdownSection
                  title={t('coins.sessionSection')}
                  lines={breakdown.sessionLines}
                  t={t}
                />
                {breakdown.bonusLines?.length > 0 && (
                  <BreakdownSection
                    title={t('coins.bonusSection')}
                    lines={breakdown.bonusLines}
                    t={t}
                  />
                )}
              </>
            )}

            <div className="rounded-xl border border-amber-200/80 dark:border-amber-800/60 bg-amber-50/80 dark:bg-amber-950/30 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles size={14} className="text-amber-600 dark:text-amber-400" />
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                  {t('coins.tipTitle')}
                </p>
              </div>
              <ul className="text-[11px] text-amber-900/80 dark:text-amber-200/80 space-y-1 leading-relaxed">
                <li>{t('coins.tipDistance')}</li>
                <li>{t('coins.tipDuration')}</li>
                <li>{t('coins.tipKcal')}</li>
                <li>{t('coins.tipLongSwim')}</li>
                <li>{t('coins.tipPace')}</li>
              </ul>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-lg text-white font-semibold text-sm shadow-pill-tint shrink-0"
            style={{ background: 'linear-gradient(135deg,#3B5BFF 0%, #7B5BFF 100%)' }}
          >
            {t('coins.continue')}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
