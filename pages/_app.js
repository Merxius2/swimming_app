/**
 * App root — Aap-SC (Swim Coach)
 */

import '../styles/globals.css';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { UserPreferencesProvider, useLanguage, useTheme } from '../context/UserPreferencesContext';
import { SwimProvider, useSwim } from '../context/SwimContext';
import { FeatureProvider } from '../context/FeatureContext';
import { DEFAULT_THEME, LANGUAGE_FAVICON_MAP } from '../lib/appConstants';
import { isThemeUnlocked } from '../lib/swimCoinStore';

import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import MobileTopActions from '../components/MobileTopActions';
import ErrorBoundary from '../components/ErrorBoundary';
import AmbientBackground from '../components/AmbientBackground';
import SecretSettingsModal from '../components/SecretSettingsModal';

function AppContent({ Component, pageProps }) {
  const router = useRouter();
  const { language } = useLanguage();
  const { theme, changeTheme } = useTheme();
  const { purchasedThemes, isLoading: swimLoading } = useSwim();
  const isHomePage = router.pathname === '/' || router.pathname === '/index';

  // Redirect legacy landing route to progress (all devices).
  useEffect(() => {
    if (isHomePage) router.replace('/progress');
  }, [isHomePage, router]);

  useEffect(() => {
    if (swimLoading) return;
    if (!isThemeUnlocked(theme, purchasedThemes)) {
      changeTheme(DEFAULT_THEME);
    }
  }, [theme, purchasedThemes, swimLoading, changeTheme]);

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
    const iconPath = LANGUAGE_FAVICON_MAP[language] || LANGUAGE_FAVICON_MAP.en;

    let faviconLink = document.querySelector("link[rel='icon'][type='image/png']");
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      faviconLink.type = 'image/png';
      document.head.appendChild(faviconLink);
    }
    faviconLink.href = iconPath;

    const appleTouchIcon = document.querySelector("link[rel='apple-touch-icon']");
    if (appleTouchIcon) appleTouchIcon.href = iconPath;
  }, [language]);

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
