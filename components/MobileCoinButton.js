import Link from 'next/link';
import { useRouter } from 'next/router';
import { Coins } from 'lucide-react';
import { useLanguage } from '../context/UserPreferencesContext';
import { useSwim } from '../context/SwimContext';

export default function MobileCoinButton() {
  const router = useRouter();
  const { t } = useLanguage();
  const { totalCoins, isLoading } = useSwim();
  const active = router.pathname === '/coins';

  return (
    <Link
      href="/coins"
      className="mobile-coin-btn lg:hidden"
      aria-label={t('coins.wheel.title')}
    >
      <span
        className={`mobile-coin-btn-inner ${active ? 'mobile-coin-btn-active' : ''}`}
      >
        <Coins size={16} strokeWidth={2.25} />
        {!isLoading && (
          <span className="mobile-coin-btn-amount tabular-nums">
            {(totalCoins ?? 0).toLocaleString()}
          </span>
        )}
      </span>
    </Link>
  );
}
