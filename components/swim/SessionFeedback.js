import { Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { useLanguage } from '../../context/UserPreferencesContext';

export default function SessionFeedback({ insights = [], badges = [] }) {
  const { t } = useLanguage();

  if (!insights.length && !badges.length) return null;

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={20} className="text-brand" />
        <h3 className="text-lg font-bold text-ink dark:text-gray-100">{t('feedback.title')}</h3>
      </div>

      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
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

      <ul className="space-y-2">
        {insights.map((insight) => {
          const isPositive = insight.includes('faster') || insight.includes('sneller')
            || insight.includes('lower') || insight.includes('lager')
            || insight.includes('over') || insight.includes('boven');
          const Icon = isPositive ? TrendingUp : TrendingDown;
          return (
            <li key={insight} className="flex items-start gap-2 text-sm text-ink-soft">
              <Icon size={16} className={`mt-0.5 shrink-0 ${isPositive ? 'text-green-500' : 'text-ink-faint'}`} />
              <span>{insight}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
