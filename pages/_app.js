/**
 * App root — Aap-SC (Swim Coach)
 */

import '../styles/globals.css';
import { useEffect, useRef } from 'react';

import { UserPreferencesProvider, useTheme } from '../context/UserPreferencesContext';
import { SwimProvider, useSwim } from '../context/SwimContext';
import { FeatureProvider } from '../context/FeatureContext';
import { DEFAULT_THEME, THEMES } from '../lib/appConstants';
import { isThemeUnlocked } from '../lib/swimCoinStore';
import { resolveAppIconSet } from '../lib/storeAppIcons';
import { loadFromCookie } from '../lib/cookieStorage';

import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import MobileTopActions from '../components/MobileTopActions';
import ErrorBoundary from '../components/ErrorBoundary';
import AmbientBackground from '../components/AmbientBackground';
import SecretSettingsModal from '../components/SecretSettingsModal';

function AppContent({ Component, pageProps }) {
  const { theme, changeTheme, isLoading: prefsLoading } = useTheme();
  const { storeUnlocks, isLoading: swimLoading, cheats, profile } = useSwim();
  const themeHydratedRef = useRef(false);

  useEffect(() => {
    if (prefsLoading || swimLoading) return;

    const allThemesUnlocked = Boolean(cheats?.allThemesUnlocked);

    if (!themeHydratedRef.current) {
      themeHydratedRef.current = true;
      const savedTheme = loadFromCookie('AUDIT_THEME_PREFERENCE');
      const savedCode = savedTheme?.theme;
      if (
        savedCode
        && THEMES.some((item) => item.code === savedCode)
        && isThemeUnlocked(savedCode, storeUnlocks, allThemesUnlocked)
        && theme !== savedCode
      ) {
        changeTheme(savedCode);
        return;
      }
    }

    if (!isThemeUnlocked(theme, storeUnlocks, allThemesUnlocked)) {
      changeTheme(DEFAULT_THEME);
    }
  }, [theme, storeUnlocks, swimLoading, prefsLoading, changeTheme, cheats?.allThemesUnlocked]);

  useEffect(() => {
    const root = document.documentElement;
    const themeClasses = Array.from(root.classList).filter((className) => className.startsWith('theme-'));
    themeClasses.forEach((className) => root.classList.remove(className));
    root.classList.add(`theme-${theme}`);
    return () => root.classList.remove(`theme-${theme}`);
  }, [theme]);

  useEffect(() => {
    const iconSet = resolveAppIconSet(profile?.activeAppIcon, storeUnlocks);
    const faviconPath = iconSet.favicon;
    const isSvg = faviconPath.endsWith('.svg');

    let faviconLink = document.querySelector("link[rel='icon']");
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      document.head.appendChild(faviconLink);
    }
    faviconLink.type = isSvg ? 'image/svg+xml' : 'image/png';
    faviconLink.href = faviconPath;

    let appleTouchIcon = document.querySelector("link[rel='apple-touch-icon']");
    if (!appleTouchIcon) {
      appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      document.head.appendChild(appleTouchIcon);
    }
    appleTouchIcon.href = iconSet.appleTouchIcon;

    let manifestLink = document.querySelector("link[rel='manifest']");
    if (manifestLink) {
      const manifest = {
        name: 'Aap-SC',
        short_name: 'Aap-SC',
        description: 'Swim Coach - Analyze Apple Fitness swim workouts',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3B5BFF',
        scope: '/',
        icons: [
          { src: iconSet.pwa192, sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: iconSet.pwa512, sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
      };
      const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
      const nextUrl = URL.createObjectURL(blob);
      const previousUrl = manifestLink.href.startsWith('blob:') ? manifestLink.href : null;
      manifestLink.href = nextUrl;
      if (previousUrl) URL.revokeObjectURL(previousUrl);
    }
  }, [profile?.activeAppIcon, storeUnlocks]);

  return (
    <div className="app-shell relative z-[1]">
      <AmbientBackground />
      <Sidebar />
      <MobileTopActions />
      <MobileNav />
      <SecretSettingsModal />
      <Component {...pageProps} />
    </div>
  );
}

export default function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <UserPreferencesProvider>
        <SwimProvider>
          <FeatureProvider>
            <AppContent Component={Component} pageProps={pageProps} />
          </FeatureProvider>
        </SwimProvider>
      </UserPreferencesProvider>
    </ErrorBoundary>
  );
}
