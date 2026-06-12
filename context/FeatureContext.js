/**
 * Feature Context
 * Consolidated context combining: SecretSettings, Sidebar
 * Manages application features and UI state
 */

import { createContext, useContext, useState, useEffect } from 'react';

const FeatureContext = createContext();

export function FeatureProvider({ children }) {
  // Secret Settings State
  const [isSecretSettingsOpen, setIsSecretSettingsOpen] = useState(false);

  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize screen size detection for sidebar
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // lg breakpoint (consistent with Tailwind)
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    setIsLoading(false);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auto-close sidebar when screen size changes to large
  useEffect(() => {
    if (isLargeScreen) {
      setIsSidebarOpen(false);
    }
  }, [isLargeScreen]);

  // Secret Settings Methods
  const openSecretSettings = () => {
    setIsSecretSettingsOpen(true);
  };

  const closeSecretSettings = () => {
    setIsSecretSettingsOpen(false);
  };

  const toggleSecretSettings = () => {
    setIsSecretSettingsOpen(!isSecretSettingsOpen);
  };

  // Sidebar Methods
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const value = {
    // Secret Settings
    isSecretSettingsOpen,
    openSecretSettings,
    closeSecretSettings,
    toggleSecretSettings,

    // Sidebar
    isSidebarOpen,
    setIsSidebarOpen,
    toggleSidebar,
    closeSidebar,
    isLargeScreen,

    // Loading
    isLoading,
  };

  return (
    <FeatureContext.Provider value={value}>
      {children}
    </FeatureContext.Provider>
  );
}

// Main hook
export function useFeature() {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeature must be used within FeatureProvider');
  }
  return context;
}

// Convenience hooks for backward compatibility
export function useSecretSettings() {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useSecretSettings must be used within FeatureProvider');
  }
  return {
    isSecretSettingsOpen: context.isSecretSettingsOpen,
    openSecretSettings: context.openSecretSettings,
    closeSecretSettings: context.closeSecretSettings,
  };
}

export function useSidebar() {
  const context = useContext(FeatureContext);
  if (!context) {
    // Return safe defaults during SSR or if used outside provider
    return {
      isSidebarOpen: false,
      setIsSidebarOpen: () => {},
      toggleSidebar: () => {},
      closeSidebar: () => {},
      isLargeScreen: false,
      isLoading: true,
    };
  }
  return {
    isSidebarOpen: context.isSidebarOpen,
    setIsSidebarOpen: context.setIsSidebarOpen,
    toggleSidebar: context.toggleSidebar,
    closeSidebar: context.closeSidebar,
    isLargeScreen: context.isLargeScreen,
    isLoading: context.isLoading,
  };
}
