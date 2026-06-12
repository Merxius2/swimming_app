/**
 * Mobile bottom navigation — Aap-SC
 */

import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  BarChart3, Upload, History, Settings, TrendingUp, Award,
} from 'lucide-react';
import { useLanguage } from '../context/UserPreferencesContext';

const TABS = [
  { path: '/progress', labelKey: 'navigation.progress', icon: BarChart3 },
  { path: '/upload', labelKey: 'navigation.upload', icon: Upload },
  { path: '/medals', labelKey: 'navigation.medals', icon: Award },
  { path: '/benchmark', labelKey: 'navigation.benchmark', icon: TrendingUp },
  { path: '/history', labelKey: 'navigation.history', icon: History },
  { path: '/settings', labelKey: 'navigation.settings', icon: Settings },
];

export default function MobileNav() {
  const router = useRouter();
  const { t } = useLanguage();
  const isActive = (path) => router.pathname === path;

  const pillBar =
    'fixed bottom-3 inset-x-2 z-[100] glass-thick rounded-full px-1.5 py-1.5 lg:hidden';
  const safePad = { paddingBottom: 'max(6px, env(safe-area-inset-bottom))' };

  const tabClass = (active) =>
    [
      'w-full flex flex-col items-center gap-0.5 py-1.5 rounded-full text-[9.5px] leading-tight transition-colors',
      active ? 'bg-white text-[#2A45CC] font-semibold shadow-sm' : 'text-ink-soft',
    ].join(' ');

  return (
    <nav className={pillBar} style={safePad}>
      <ul className="grid grid-cols-6 gap-0.5">
        {TABS.map(({ path, labelKey, icon: Icon }) => (
          <li key={path}>
            <Link href={path}>
              <button type="button" className={tabClass(isActive(path))}>
                <Icon size={17} />
                <span className="max-w-[56px] truncate">{t(labelKey)}</span>
              </button>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
