/**
 * Mobile bottom navigation — Aap-SC
 */

import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  BarChart3, Upload, History, Settings, Home,
} from 'lucide-react';
import { useLanguage } from '../context/UserPreferencesContext';

export default function MobileNav() {
  const router = useRouter();
  const { t } = useLanguage();
  const isActive = (path) => router.pathname === path;

  const pillBar =
    'fixed bottom-3 inset-x-3 z-[100] glass-thick rounded-full px-2 py-1.5 lg:hidden';
  const safePad = { paddingBottom: 'max(6px, env(safe-area-inset-bottom))' };

  const tabClass = (active) =>
    [
      'w-full flex flex-col items-center gap-0.5 py-1.5 rounded-full text-[10.5px] transition-colors',
      active ? 'bg-white text-[#2A45CC] font-semibold shadow-sm' : 'text-ink-soft',
    ].join(' ');

  return (
    <>
      {!isActive('/') && (
        <Link href="/">
          <button
            type="button"
            className="fixed top-3 right-3 h-12 w-12 lg:hidden z-[99] inline-flex items-center justify-center rounded-full text-white shadow-pill-tint transition-transform hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg,#3B5BFF 0%, #7B5BFF 100%)' }}
            title={t('navigation.home')}
          >
            <Home size={20} />
          </button>
        </Link>
      )}

      <nav className={pillBar} style={safePad}>
        <ul className="grid grid-cols-4 gap-0.5">
          <li>
            <Link href="/progress">
              <button type="button" className={tabClass(isActive('/progress'))}>
                <BarChart3 size={18} />
                <span>{t('navigation.progress')}</span>
              </button>
            </Link>
          </li>
          <li>
            <Link href="/upload">
              <button type="button" className={tabClass(isActive('/upload'))}>
                <Upload size={18} />
                <span>{t('navigation.upload')}</span>
              </button>
            </Link>
          </li>
          <li>
            <Link href="/history">
              <button type="button" className={tabClass(isActive('/history'))}>
                <History size={18} />
                <span>{t('navigation.history')}</span>
              </button>
            </Link>
          </li>
          <li>
            <Link href="/settings">
              <button type="button" className={tabClass(isActive('/settings'))}>
                <Settings size={18} />
                <span>{t('navigation.settings')}</span>
              </button>
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
