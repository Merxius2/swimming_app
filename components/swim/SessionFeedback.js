import { Sparkles, TrendingUp, TrendingDown, Bot } from 'lucide-react';
import { useLanguage } from '../../context/UserPreferencesContext';

export default function SessionFeedback({
  insights = [],
  badges = [],
  coachMessage = '',
  motivation = '',
  aiEnhanced = false,
  loading = false,
}) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2 text-ink-soft">
          <Sparkles size={20} className="animate-pulse text-brand" />
          <p>{t('feedback.aiLoading')}</p>
        </div>
      </div>
    );
  }

  if (!insights.length && !badges.length && !coachMessage && !motivation) return null;

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles size={20} className="text-brand" />
        <h3 className="text-lg font-bold text-ink dark:text-gray-100">{t('feedback.title')}</h3>
        {aiEnhanced && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
            <Bot size={12} />
            AI
          </span>
        )}
      </div>

      {coachMessage && (
        <p className="text-[15px] leading-relaxed text-ink dark:text-gray-200">{coachMessage}</p>
      )}

      {motivation && (
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
            const isPositive = /faster|sneller|lower|lager|over|boven|record|streak|reeks|быстрее|hızlı|daha hızlı/i.test(insight);
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
    </div>
  );
}
