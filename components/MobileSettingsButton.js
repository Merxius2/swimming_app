import Link from 'next/link';
import { useRouter } from 'next/router';
import { Settings } from 'lucide-react';
import { useLanguage } from '../context/UserPreferencesContext';

export default function MobileSettingsButton() {
  const router = useRouter();
  const { t } = useLanguage();
  const active = router.pathname === '/settings';

  return (
    <Link
      href="/settings"
      className="mobile-settings-btn lg:hidden"
      aria-label={t('navigation.settings')}
    >
      <button
        type="button"
        aria-current={active ? 'page' : undefined}
        className={`mobile-settings-btn-inner ${active ? 'mobile-settings-btn-active' : ''}`}
      >
        <Settings size={20} strokeWidth={active ? 2.5 : 2} />
      </button>
    </Link>
  );
}
