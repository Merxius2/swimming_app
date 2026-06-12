import { Coins } from 'lucide-react';
import { useLanguage } from '../../context/UserPreferencesContext';

export default function CoinBadge({ amount, size = 'md', className = '' }) {
  const { t } = useLanguage();
  const iconSize = size === 'sm' ? 14 : 16;
  const textClass = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold tabular-nums text-amber-600 dark:text-amber-400 ${textClass} ${className}`}
      title={t('coins.label')}
    >
      <Coins size={iconSize} strokeWidth={2.25} />
      {(amount ?? 0).toLocaleString()}
    </span>
  );
}
