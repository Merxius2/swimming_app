import Link from 'next/link';
import { useRouter } from 'next/router';
import { Coins, Settings } from 'lucide-react';
import { useLanguage } from '../context/UserPreferencesContext';
import { useSwim } from '../context/SwimContext';

export default function MobileTopActions() {
  const router = useRouter();
  const { t } = useLanguage();
  const { totalCoins, isLoading } = useSwim();
  const coinsActive = router.pathname === '/coins';
  const settingsActive = router.pathname === '/settings';

  return (
    <div className="mobile-top-actions lg:hidden" aria-label={t('navigation.swimCoach')}>
      <Link
        href="/coins"
        className={`mobile-top-actions-coins ${coinsActive ? 'mobile-top-actions-coins-active' : ''}`}
        aria-label={t('coins.wheel.title')}
        aria-current={coinsActive ? 'page' : undefined}
      >
        <Coins size={16} strokeWidth={2.25} />
        {!isLoading && (
          <span className="mobile-top-actions-coin-amount tabular-nums">
            {(totalCoins ?? 0).toLocaleString()}
          </span>
        )}
      </Link>

      <span className="mobile-top-actions-divider" aria-hidden="true" />

      <Link
        href="/settings"
        className={`mobile-top-actions-settings ${settingsActive ? 'mobile-top-actions-settings-active' : ''}`}
        aria-label={t('navigation.settings')}
        aria-current={settingsActive ? 'page' : undefined}
      >
        <Settings size={20} strokeWidth={settingsActive ? 2.5 : 2} />
      </Link>
    </div>
  );
}
