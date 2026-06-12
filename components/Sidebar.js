/**
 * Desktop sidebar — Aap-SC Swim Coach
 */

import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  BarChart3, Upload, History, TrendingUp, Settings, Award,
} from 'lucide-react';

import { useLanguage } from '../context/UserPreferencesContext';
import { useSwim } from '../context/SwimContext';
import { evaluateAllMedals, getMedalStats } from '../lib/swimMedals';
import SecretAppIcon from './SecretAppIcon';
import CoinBadge from './swim/CoinBadge';

const NAV = [
  {
    titleKey: 'navigation.swimCoach',
    items: [
      { path: '/progress', labelKey: 'navigation.progress', icon: BarChart3 },
      { path: '/upload', labelKey: 'navigation.upload', icon: Upload },
      { path: '/history', labelKey: 'navigation.history', icon: History },
      { path: '/benchmark', labelKey: 'navigation.benchmark', icon: TrendingUp },
      { path: '/medals', labelKey: 'navigation.medals', icon: Award },
    ],
  },
];

export default function Sidebar() {
  const router = useRouter();
  const { t } = useLanguage();
  const { sessions, isLoading, cheats, totalCoins } = useSwim();
  const isActive = (path) => router.pathname === path;

  const medalStats = getMedalStats(
    evaluateAllMedals(sessions, { allMedalsUnlocked: cheats?.allMedalsUnlocked })
  );

  const itemClass = (active, isUpload = false) => {
    if (isUpload) {
      return [
        'sidebar-upload-btn flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all',
        active ? 'sidebar-upload-btn-active' : '',
      ].join(' ');
    }
    return [
      'flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-[13.5px] font-medium transition-all',
      active
        ? 'bg-tint-soft text-[#2A45CC] dark:bg-tint/15 dark:text-[#C8D2FF]'
        : 'text-ink-soft hover:bg-black/[0.04] dark:text-[#A1A1AA] dark:hover:bg-white/[0.04]',
    ].join(' ');
  };

  const medalBadgeClass = (active) =>
    [
      'text-[11px] font-semibold tabular-nums shrink-0',
      active ? 'text-[#2A45CC] dark:text-[#C8D2FF]' : 'text-ink-faint',
    ].join(' ');

  return (
    <aside className="hidden lg:flex fixed left-3 top-3 bottom-3 w-[220px] z-30 flex-col glass-thick rounded-md p-3">
      <div className="flex items-center gap-2.5 px-2 pt-1.5 pb-3">
        <SecretAppIcon size={32} />
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
                const active = isActive(item.path);
                const isUpload = item.path === '/upload';
                const isMedals = item.path === '/medals';
                return (
                  <Link key={item.path} href={item.path}>
                    <div className={`${itemClass(active, isUpload)} ${isMedals ? 'justify-between' : ''}`}>
                      <span className="flex items-center gap-2.5 min-w-0">
                        <Icon size={isUpload ? 18 : 17} strokeWidth={isUpload ? 2.5 : 2} />
                        <span>{t(item.labelKey)}</span>
                      </span>
                      {isMedals && !isLoading && (
                        <span className={medalBadgeClass(active)} aria-label={`${medalStats.earned} of ${medalStats.total} medals earned`}>
                          {medalStats.earned}/{medalStats.total}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-2 py-2 mt-auto border-t border-black/[0.06] dark:border-white/[0.06]">
        <CoinBadge amount={totalCoins} size="sm" />
      </div>

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
