/**
 * Secret settings modal state.
 */

import { createContext, useContext, useState } from 'react';

const FeatureContext = createContext();

export function FeatureProvider({ children }) {
  const [isSecretSettingsOpen, setIsSecretSettingsOpen] = useState(false);

  const openSecretSettings = () => setIsSecretSettingsOpen(true);
  const closeSecretSettings = () => setIsSecretSettingsOpen(false);

  return (
    <FeatureContext.Provider
      value={{
        isSecretSettingsOpen,
        openSecretSettings,
        closeSecretSettings,
        toggleSecretSettings: () => setIsSecretSettingsOpen((open) => !open),
      }}
    >
      {children}
    </FeatureContext.Provider>
  );
}

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
