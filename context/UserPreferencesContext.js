/**
 * User preferences — dark mode, language, and theme.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { saveToCookie, loadFromCookie } from '../lib/cookieStorage';
import translations from '../lib/i18n';
import { DEFAULT_LANGUAGE, DEFAULT_THEME, THEMES } from '../lib/appConstants';

const UserPreferencesContext = createContext();

function resolveTranslation(lang, key) {
  const keys = key.split('.');
  let value = translations[lang];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return null;
    }
  }

  return typeof value === 'string' ? value : null;
}

export function UserPreferencesProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedDarkMode = loadFromCookie('AUDIT_DARK_MODE_PREFERENCE');
    const savedAutoMode = loadFromCookie('AUDIT_DARK_MODE_AUTO');

    if (savedAutoMode !== null) {
      setIsAutoMode(savedAutoMode === 'true');
    }

    if (savedAutoMode === null || savedAutoMode === 'true') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      setIsAutoMode(true);
    } else if (savedDarkMode !== null) {
      setIsDarkMode(savedDarkMode === 'true');
      setIsAutoMode(false);
    }

    const savedLanguage = loadFromCookie('AUDIT_LANGUAGE_PREFERENCE');
    if (savedLanguage?.language) {
      const lang = savedLanguage.language === 'mu' ? DEFAULT_LANGUAGE : savedLanguage.language;
      setLanguage(lang);
      if (savedLanguage.language === 'mu') {
        saveToCookie('AUDIT_LANGUAGE_PREFERENCE', { language: DEFAULT_LANGUAGE }, 365);
      }
    }

    const savedTheme = loadFromCookie('AUDIT_THEME_PREFERENCE');
    if (savedTheme?.theme && THEMES.some((item) => item.code === savedTheme.theme)) {
      setTheme(savedTheme.theme);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode, isLoading]);

  useEffect(() => {
    if (!isAutoMode || isLoading) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setIsDarkMode(e.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isAutoMode, isLoading]);

  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    if (!isAutoMode) {
      saveToCookie('AUDIT_DARK_MODE_PREFERENCE', newValue ? 'true' : 'false', 365);
    }
  };

  const toggleAutoMode = () => {
    const newAutoMode = !isAutoMode;
    setIsAutoMode(newAutoMode);
    saveToCookie('AUDIT_DARK_MODE_AUTO', newAutoMode ? 'true' : 'false', 365);

    if (newAutoMode) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  };

  const changeLanguage = (lang) => {
    const next = lang === 'mu' ? DEFAULT_LANGUAGE : lang;
    setLanguage(next);
    saveToCookie('AUDIT_LANGUAGE_PREFERENCE', { language: next }, 365);
  };

  const t = (key) => {
    return resolveTranslation(language, key)
      ?? resolveTranslation(DEFAULT_LANGUAGE, key)
      ?? key;
  };

  const changeTheme = (nextTheme) => {
    if (!THEMES.some((item) => item.code === nextTheme)) return;
    setTheme(nextTheme);
    saveToCookie('AUDIT_THEME_PREFERENCE', { theme: nextTheme }, 365);
  };

  const value = {
    isDarkMode,
    toggleDarkMode,
    isAutoMode,
    toggleAutoMode,
    language,
    changeLanguage,
    t,
    theme,
    changeTheme,
    THEMES,
    isLoading,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider');
  }
  return context;
}

export function useDarkMode() {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useDarkMode must be used within UserPreferencesProvider');
  }
  return {
    isDarkMode: context.isDarkMode,
    toggleDarkMode: context.toggleDarkMode,
    isAutoMode: context.isAutoMode,
    toggleAutoMode: context.toggleAutoMode,
    isLoading: context.isLoading,
  };
}

export function useLanguage() {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useLanguage must be used within UserPreferencesProvider');
  }
  return {
    language: context.language,
    changeLanguage: context.changeLanguage,
    t: context.t,
    isLoading: context.isLoading,
  };
}

export function useTheme() {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useTheme must be used within UserPreferencesProvider');
  }
  return {
    theme: context.theme,
    changeTheme: context.changeTheme,
    THEMES: context.THEMES,
    isLoading: context.isLoading,
  };
}
