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
  BarChart3, Upload, History, TrendingUp, Award,
} from 'lucide-react';
import { useLanguage } from '../context/UserPreferencesContext';

const TABS = [
  { path: '/progress', labelKey: 'navigation.progress', icon: BarChart3 },
  { path: '/medals', labelKey: 'navigation.medals', icon: Award },
  null, // center slot — upload FAB
  { path: '/benchmark', labelKey: 'navigation.benchmark', icon: TrendingUp },
  { path: '/history', labelKey: 'navigation.history', icon: History },
];

function useVisualViewportPin(ref) {
  useEffect(() => {
    const el = ref.current;
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!el || !vv) return undefined;

    const sync = () => {
      const inset = Math.max(0, window.innerHeight - vv.offsetTop - vv.height);
      // Only lift for keyboard-sized insets — small values leave a gap at the screen bottom.
      el.style.transform = inset > 75 ? `translate3d(0, ${-inset}px, 0)` : '';
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
    <Link href={path} className="mobile-nav-tab">
      <button
        type="button"
        className={`mobile-nav-tab-btn ${isActive ? 'mobile-nav-tab-active' : ''}`}
      >
        <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
        <span className="mobile-nav-tab-label">{t(labelKey)}</span>
      </button>
    </Link>
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
        {TABS.map((tab) => {
          if (tab === null) {
            return (
              <div key="upload" className="mobile-nav-fab-wrap">
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
            );
          }
          return (
            <NavTab
              key={tab.path}
              {...tab}
              isActive={isActive(tab.path)}
              t={t}
            />
          );
        })}
      </div>
    </nav>
  );

  if (!mounted) return null;
  return createPortal(nav, document.body);
}
