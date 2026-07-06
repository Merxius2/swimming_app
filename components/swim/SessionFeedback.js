import { Sparkles, TrendingUp, TrendingDown, Bot, Lightbulb } from 'lucide-react';
import { useLanguage } from '../../context/UserPreferencesContext';
import { useSwim } from '../../context/SwimContext';
import MascotCoach from '../mascot/MascotCoach';
import { resolveMascotLevel, resolveMascotSex } from '../../lib/mascotConstants';

function pickMascotMessage({ coachMessage, motivation, tip, insights, loading, t }) {
  if (loading) return t('mascot.thinking');
  if (coachMessage) return coachMessage;
  if (motivation) return motivation;
  if (tip) return tip;
  if (insights?.length) return insights[0];
  return t('mascot.defaultCheer');
}

export default function SessionFeedback({
  insights = [],
  badges = [],
  coachMessage = '',
  motivation = '',
  highlights = [],
  tip = '',
  benchmarkLevel = null,
  aiEnhanced = false,
  loading = false,
}) {
  const { t } = useLanguage();
  const { profile } = useSwim();

  const mascotSex = resolveMascotSex(profile);

  const mascotMessage = pickMascotMessage({
    coachMessage,
    motivation,
    tip,
    insights,
    loading,
    t,
  });

  const mascotLevel = resolveMascotLevel(benchmarkLevel);
  const hasContent = loading
    || insights.length
    || badges.length
    || coachMessage
    || motivation
    || highlights.length
    || tip;

  if (!hasContent) return null;

  return (
    <div className="card p-6 space-y-5 overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        <div className="shrink-0 w-full sm:w-auto flex justify-center sm:pt-2">
          <MascotCoach
            message={mascotMessage}
            sex={mascotSex}
            level={mascotLevel}
            equipped={profile?.mascotEquipped || []}
            size={130}
            animated
          />
        </div>

        <div className="flex-1 min-w-0 space-y-4 w-full">
          <div className="flex items-center gap-2 flex-wrap">
            <Sparkles size={20} className="text-brand" />
            <h3 className="text-lg font-bold text-ink dark:text-gray-100">{t('feedback.title')}</h3>
            {benchmarkLevel && benchmarkLevel !== 'unknown' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {t(`benchmark.levels.${benchmarkLevel}`)}
              </span>
            )}
            {aiEnhanced && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                <Bot size={12} />
                AI
              </span>
            )}
          </div>

          {loading ? (
            <p className="text-sm text-ink-soft animate-pulse">{t('feedback.aiLoading')}</p>
          ) : (
            <>
              {highlights.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {highlights.map((item) => (
                    <div
                      key={`${item.label}-${item.value}`}
                      className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/40 px-3 py-2"
                    >
                      <p className="text-[10px] uppercase tracking-wider text-ink-faint">{item.label}</p>
                      <p className="text-sm font-semibold text-ink mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {motivation && coachMessage && (
                <p className="text-sm font-medium text-brand dark:text-[#C8D2FF] italic">{motivation}</p>
              )}

              {badges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                    >
                      <Sparkles size={12} />
                      {badge}
                    </span>
                  ))}
                </div>
              )}

              {insights.length > 0 && (
                <ul className="space-y-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                  {insights.map((insight) => {
                    const isPositive = /faster|sneller|lower|lager|over|boven|record|streak|reeks|быстрее|hızlı|daha hızlı|improv|trending|percentile|above|median/i.test(insight);
                    const Icon = isPositive ? TrendingUp : TrendingDown;
                    return (
                      <li key={insight} className="flex items-start gap-2 text-sm text-ink-soft">
                        <Icon size={16} className={`mt-0.5 shrink-0 ${isPositive ? 'text-green-500' : 'text-ink-faint'}`} />
                        <span>{insight}</span>
                      </li>
                    );
                  })}
                </ul>
              )}

              {tip && (
                <div className="rounded-xl border border-brand/20 bg-tint-soft/30 dark:bg-brand/10 px-4 py-3 flex gap-3">
                  <Lightbulb size={18} className="text-brand shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-brand mb-1">
                      {t('feedback.tipTitle')}
                    </p>
                    <p className="text-sm leading-relaxed text-ink-soft">{tip}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
