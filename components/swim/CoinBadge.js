import { Coins } from 'lucide-react';
import { useLanguage } from '../../context/UserPreferencesContext';
import { useSwim } from '../../context/SwimContext';
import { hasGoldenCoinBadge } from '../../lib/swimCoinStore';

export default function CoinBadge({ amount, size = 'md', className = '', golden = false }) {
  const { t } = useLanguage();
  const { storeUnlocks } = useSwim();
  const isGolden = golden || hasGoldenCoinBadge(storeUnlocks);
  const iconSize = size === 'sm' ? 14 : 16;
  const textClass = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 font-semibold tabular-nums',
        isGolden ? 'coin-badge-golden' : 'text-amber-600 dark:text-amber-400',
        textClass,
        className,
      ].join(' ')}
      title={t('coins.label')}
    >
      <Coins size={iconSize} strokeWidth={2.25} />
      {(amount ?? 0).toLocaleString()}
    </span>
  );
}
