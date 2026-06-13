/**
 * App root — Aap-SC (Swim Coach)
 */

import '../styles/globals.css';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

import { UserPreferencesProvider, useLanguage, useTheme } from '../context/UserPreferencesContext';
import { SwimProvider, useSwim } from '../context/SwimContext';
import { FeatureProvider } from '../context/FeatureContext';
import { DEFAULT_THEME, THEMES } from '../lib/appConstants';
import { isThemeUnlocked } from '../lib/swimCoinStore';
import { resolveAppIconPath } from '../lib/storeAppIcons';
import { loadFromCookie } from '../lib/cookieStorage';

import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import MobileTopActions from '../components/MobileTopActions';
import ErrorBoundary from '../components/ErrorBoundary';
import AmbientBackground from '../components/AmbientBackground';
import SecretSettingsModal from '../components/SecretSettingsModal';

function AppContent({ Component, pageProps }) {
  const router = useRouter();
  const { language } = useLanguage();
  const { theme, changeTheme, isLoading: prefsLoading } = useTheme();
  const { storeUnlocks, isLoading: swimLoading, cheats, profile } = useSwim();
  const themeHydratedRef = useRef(false);
  const isHomePage = router.pathname === '/' || router.pathname === '/index';

  // Redirect legacy landing route to progress (all devices).
  useEffect(() => {
    if (isHomePage) router.replace('/progress');
  }, [isHomePage, router]);

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
    document.documentElement.classList.toggle('lang-mu', language === 'mu');
    return () => document.documentElement.classList.remove('lang-mu');
  }, [language]);

  useEffect(() => {
    const root = document.documentElement;
    const themeClasses = Array.from(root.classList).filter((className) => className.startsWith('theme-'));
    themeClasses.forEach((className) => root.classList.remove(className));
    root.classList.add(`theme-${theme}`);
    return () => root.classList.remove(`theme-${theme}`);
  }, [theme]);

  useEffect(() => {
    const iconPath = resolveAppIconPath(profile?.activeAppIcon, storeUnlocks);
    const isSvg = iconPath.endsWith('.svg');

    let faviconLink = document.querySelector("link[rel='icon']");
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      document.head.appendChild(faviconLink);
    }
    faviconLink.type = isSvg ? 'image/svg+xml' : 'image/png';
    faviconLink.href = iconPath;

    const appleTouchIcon = document.querySelector("link[rel='apple-touch-icon']");
    if (appleTouchIcon) appleTouchIcon.href = iconPath;
  }, [profile?.activeAppIcon, storeUnlocks]);

  return (
    <>
      <AmbientBackground />
      <Sidebar />
      <MobileTopActions />
      <MobileNav />
      <SecretSettingsModal />
      <Component {...pageProps} />
    </>
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
