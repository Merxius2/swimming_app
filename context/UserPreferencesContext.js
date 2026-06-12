/**
 * User Preferences Context
 * Consolidated context combining: DarkMode, Language, Currency, RainbowMode, Theme
 * Reduces provider nesting and centralizes user preference management
 */

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { saveToCookie, loadFromCookie } from '../lib/cookieStorage';
import translations from '../lib/i18n';
import { CURRENCIES, DEFAULT_LANGUAGE, DEFAULT_THEME, THEMES } from '../lib/appConstants';

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
  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);

  // Language State
  const [language, setLanguage] = useState('en');

  // Currency State
  const [currency, setCurrency] = useState('EUR');

  // Rainbow Mode State
  const [isRainbow, setIsRainbow] = useState(false);

  // Theme State
  const [theme, setTheme] = useState(DEFAULT_THEME);

  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  const anthemAudioRef = useRef(null);

  // Load all preferences from cookies on mount
  useEffect(() => {
    // Load dark mode preferences
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

    // Load language preference
    const savedLanguage = loadFromCookie('AUDIT_LANGUAGE_PREFERENCE');
    if (savedLanguage && savedLanguage.language) {
      setLanguage(savedLanguage.language);
    }

    // Load currency preference
    const savedCurrency = loadFromCookie('AUDIT_CURRENCY_PREFERENCE');
    if (savedCurrency && savedCurrency.currency) {
      setCurrency(savedCurrency.currency);
    }

    // Load rainbow mode preference
    const savedRainbow = loadFromCookie('AUDIT_RAINBOW_MODE_PREFERENCE');
    if (savedRainbow !== null) {
      setIsRainbow(savedRainbow);
    }

    // Load theme preference
    const savedTheme = loadFromCookie('AUDIT_THEME_PREFERENCE');
    if (savedTheme?.theme && THEMES.some((item) => item.code === savedTheme.theme)) {
      setTheme(savedTheme.theme);
    }

    setIsLoading(false);
  }, []);

  // Update the DOM when dark mode changes
  useEffect(() => {
    if (isLoading) return;

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode, isLoading]);

  // Listen for system theme changes when auto mode is enabled
  useEffect(() => {
    if (!isAutoMode || isLoading) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isAutoMode, isLoading]);

  // Dark Mode Methods
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

  // Language Methods
  const stopAnthem = () => {
    const audio = anthemAudioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    anthemAudioRef.current = null;
  };

  const changeLanguage = (lang) => {
    stopAnthem();
    setLanguage(lang);
    saveToCookie('AUDIT_LANGUAGE_PREFERENCE', { language: lang }, 365);

    if (lang === 'mu') {
      const audio = new Audio('/usa-anthem.mp3');
      anthemAudioRef.current = audio;
      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
  };

  const t = (key) => {
    const lang = language === 'mu' ? DEFAULT_LANGUAGE : language;
    return resolveTranslation(lang, key)
      ?? resolveTranslation(DEFAULT_LANGUAGE, key)
      ?? key;
  };

  // Currency Methods
  const changeCurrency = (curr) => {
    setCurrency(curr);
    saveToCookie('AUDIT_CURRENCY_PREFERENCE', { currency: curr }, 365);
  };

  const getSymbol = () => {
    return CURRENCIES[currency]?.symbol || '€';
  };

  const getCurrencyName = () => {
    return CURRENCIES[currency]?.name || 'Euro';
  };

  // Rainbow Mode Methods
  const toggleRainbow = () => {
    const newValue = !isRainbow;
    setIsRainbow(newValue);
    saveToCookie('AUDIT_RAINBOW_MODE_PREFERENCE', newValue, 365);
  };

  // Theme Methods
  const changeTheme = (nextTheme) => {
    if (!THEMES.some((item) => item.code === nextTheme)) return;
    setTheme(nextTheme);
    saveToCookie('AUDIT_THEME_PREFERENCE', { theme: nextTheme }, 365);
  };

  const value = {
    // Dark Mode
    isDarkMode,
    toggleDarkMode,
    isAutoMode,
    toggleAutoMode,

    // Language
    language,
    changeLanguage,
    t,

    // Currency
    currency,
    changeCurrency,
    getSymbol,
    getCurrencyName,
    CURRENCIES,

    // Rainbow Mode
    isRainbow,
    toggleRainbow,

    // Theme
    theme,
    changeTheme,
    THEMES,

    // Loading
    isLoading,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

// Individual hooks for backward compatibility and convenience
export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider');
  }
  return context;
}

// Convenience hooks that wrap the main context
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

export function useCurrency() {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useCurrency must be used within UserPreferencesProvider');
  }
  return {
    currency: context.currency,
    changeCurrency: context.changeCurrency,
    getSymbol: context.getSymbol,
    getCurrencyName: context.getCurrencyName,
    CURRENCIES: context.CURRENCIES,
    isLoading: context.isLoading,
  };
}

export function useRainbowMode() {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useRainbowMode must be used within UserPreferencesProvider');
  }
  return {
    isRainbow: context.isRainbow,
    toggleRainbow: context.toggleRainbow,
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
