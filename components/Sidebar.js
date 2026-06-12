/**
 * Desktop sidebar — Aap-SC Swim Coach
 */

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import {
  BarChart3, Upload, History, TrendingUp, Settings,
} from 'lucide-react';

import { useLanguage } from '../context/UserPreferencesContext';
import { LANGUAGE_FAVICON_MAP } from '../lib/appConstants';

const NAV = [
  {
    titleKey: 'navigation.swimCoach',
    items: [
      { path: '/progress', labelKey: 'navigation.progress', icon: BarChart3 },
      { path: '/upload', labelKey: 'navigation.upload', icon: Upload },
      { path: '/history', labelKey: 'navigation.history', icon: History },
      { path: '/benchmark', labelKey: 'navigation.benchmark', icon: TrendingUp },
    ],
  },
];

export default function Sidebar() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const isActive = (path) => router.pathname === path;
  const iconPath = LANGUAGE_FAVICON_MAP[language] || LANGUAGE_FAVICON_MAP.en;

  const itemClass = (active) =>
    [
      'flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-[13.5px] font-medium transition-all',
      active
        ? 'bg-tint-soft text-[#2A45CC] dark:bg-tint/15 dark:text-[#C8D2FF]'
        : 'text-ink-soft hover:bg-black/[0.04] dark:text-[#A1A1AA] dark:hover:bg-white/[0.04]',
    ].join(' ');

  return (
    <aside className="hidden lg:flex fixed left-3 top-3 bottom-3 w-[220px] z-30 flex-col glass-thick rounded-md p-3">
      <div className="flex items-center gap-2.5 px-2 pt-1.5 pb-3">
        <Link href="/">
          <Image src={iconPath} alt="Aap-SC" width={32} height={32} className="rounded-full" />
        </Link>
        <div>
          <span className="font-semibold text-[15px] tracking-tight block">Aap-SC</span>
          <span className="text-[10px] text-ink-faint uppercase tracking-wider">Swim Coach</span>
        </div>
      </div>

      <nav className="flex-1 space-y-5 px-1 mt-1 overflow-y-auto">
        {NAV.map((section) => (
          <div key={section.titleKey}>
            <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
              {t(section.titleKey)}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.path} href={item.path}>
                    <div className={itemClass(isActive(item.path))}>
                      <Icon size={17} />
                      <span>{t(item.labelKey)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <Link href="/settings">
        <div className={`${itemClass(isActive('/settings'))} mt-auto`}>
          <Settings size={17} />
          <span>{t('navigation.settings')}</span>
        </div>
      </Link>

      <p className="px-2 pt-3 text-[10px] text-ink-faint">© 2026 Aap-SC</p>
    </aside>
  );
}
