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

const LEFT_TABS = [
  { path: '/progress', labelKey: 'navigation.progress', icon: BarChart3 },
  { path: '/medals', labelKey: 'navigation.medals', icon: Award },
];

const RIGHT_TABS = [
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

function NavTab({ path, labelKey, icon: Icon, isActive, t }) {
  return (
    <li className="flex-1 min-w-0">
      <Link href={path}>
        <button
          type="button"
          className={`w-full flex flex-col items-center gap-0.5 py-2 rounded-full text-[9.5px] leading-tight transition-colors ${
            isActive ? 'text-[#2A45CC] font-semibold' : 'text-ink-soft'
          }`}
        >
          <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
          <span className="max-w-[52px] truncate">{t(labelKey)}</span>
        </button>
      </Link>
    </li>
  );
}

export default function MobileNav() {
  const router = useRouter();
  const { t } = useLanguage();
  const navRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useVisualViewportPin(navRef);

  const isActive = (path) => router.pathname === path;
  const uploadActive = router.pathname === '/upload';

  const nav = (
    <nav ref={navRef} className="mobile-nav-bar glass-thick lg:hidden" aria-label={t('navigation.swimCoach')}>
      <div className="mobile-nav-inner">
        <ul className="mobile-nav-side">
          {LEFT_TABS.map((tab) => (
            <NavTab key={tab.path} {...tab} isActive={isActive(tab.path)} t={t} />
          ))}
        </ul>

        <div className="mobile-nav-fab-wrap">
          <Link href="/upload">
            <button
              type="button"
              aria-label={t('navigation.upload')}
              aria-current={uploadActive ? 'page' : undefined}
              className={`mobile-nav-fab ${uploadActive ? 'mobile-nav-fab-active' : ''}`}
            >
              <Upload size={26} strokeWidth={2.5} />
            </button>
          </Link>
          <span className={`mobile-nav-fab-label ${uploadActive ? 'text-[#2A45CC] font-semibold' : 'text-ink-soft'}`}>
            {t('navigation.upload')}
          </span>
        </div>

        <ul className="mobile-nav-side">
          {RIGHT_TABS.map((tab) => (
            <NavTab key={tab.path} {...tab} isActive={isActive(tab.path)} t={t} />
          ))}
        </ul>
      </div>
    </nav>
  );

  if (!mounted) return null;
  return createPortal(nav, document.body);
}
