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
  BarChart3, History, TrendingUp, Award, Gamepad2,
} from 'lucide-react';
import { useLanguage } from '../context/UserPreferencesContext';
import NavPageIcon from './NavPageIcon';

const TABS = [
  { path: '/mini-games', labelKey: 'navigation.miniGames', icon: Gamepad2, pageKey: 'mini-games' },
  { path: '/medals', labelKey: 'navigation.medals', icon: Award, pageKey: 'medals' },
  null,
  { path: '/benchmark', labelKey: 'navigation.benchmark', icon: TrendingUp, pageKey: 'benchmark' },
  { path: '/history', labelKey: 'navigation.history', icon: History, pageKey: 'history' },
];

function useVisualViewportPin(ref) {
  useEffect(() => {
    const el = ref.current;
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!el || !vv) return undefined;

    const sync = () => {
      const inset = Math.max(0, window.innerHeight - vv.offsetTop - vv.height);
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

function NavTab({ path, labelKey, icon, pageKey, isActive, t }) {
  return (
    <Link href={path} className="mobile-nav-tab">
      <button
        type="button"
        className={`mobile-nav-tab-btn ${isActive ? 'mobile-nav-tab-active' : ''}`}
      >
        <NavPageIcon icon={icon} pageKey={pageKey} size={17} strokeWidth={isActive ? 2.5 : 2} />
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
  const progressActive = router.pathname === '/progress';

  const nav = (
    <nav ref={navRef} className="mobile-nav-bar glass-thick lg:hidden" aria-label={t('navigation.swimCoach')}>
      <div className="mobile-nav-inner">
        {TABS.map((tab) => {
          if (tab === null) {
            return (
              <div key="progress" className="mobile-nav-fab-wrap">
                <Link href="/progress">
                  <button
                    type="button"
                    aria-label={t('navigation.progress')}
                    aria-current={progressActive ? 'page' : undefined}
                    className={`mobile-nav-fab ${progressActive ? 'mobile-nav-fab-active' : ''}`}
                  >
                    <NavPageIcon icon={BarChart3} pageKey="progress" size={26} strokeWidth={2.5} />
                  </button>
                </Link>
                <span className={`mobile-nav-fab-label ${progressActive ? 'text-[#2A45CC] font-semibold' : 'text-ink-soft'}`}>
                  {t('navigation.progress')}
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
