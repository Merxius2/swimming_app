/**
 * Mobile bottom navigation — Aap-SC
 * Portaled to document.body and pinned to the visual viewport so it
 * stays fixed while scrolling on iOS Safari.
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

function useVisualViewportPin(ref) {
  useEffect(() => {
    const el = ref.current;
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!el || !vv) return undefined;

    const sync = () => {
      const inset = Math.max(0, window.innerHeight - vv.offsetTop - vv.height);
      el.style.transform = inset > 0 ? `translate3d(0, ${-inset}px, 0)` : '';
    };

    sync();
    vv.addEventListener('resize', sync);
    vv.addEventListener('scroll', sync);
    window.addEventListener('orientationchange', sync);

    return () => {
      vv.removeEventListener('resize', sync);
      vv.removeEventListener('scroll', sync);
      window.removeEventListener('orientationchange', sync);
      el.style.transform = '';
    };
  }, [ref]);
}

export default function MobileNav() {
  const router = useRouter();
  const { t } = useLanguage();
  const navRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useVisualViewportPin(navRef);

  const isActive = (path) => router.pathname === path;

  const tabClass = (active) =>
    [
      'w-full flex flex-col items-center gap-0.5 py-1.5 rounded-full text-[9.5px] leading-tight transition-colors',
      active ? 'bg-white text-[#2A45CC] font-semibold shadow-sm' : 'text-ink-soft',
    ].join(' ');

  const nav = (
    <nav ref={navRef} className="mobile-nav-bar glass-thick lg:hidden" aria-label={t('navigation.swimCoach')}>
      <ul className="grid grid-cols-6 gap-0.5 px-1.5 py-1.5">
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

  if (!mounted) return null;
  return createPortal(nav, document.body);
}
