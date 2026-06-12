import { Moon, Sun, Globe } from 'lucide-react';
import { useDarkMode, useLanguage } from '../../context/UserPreferencesContext';
import ThemedIcon from '../ThemedIcon';

export default function DarkModeSettings() {
  const { t } = useLanguage();
  const { isDarkMode, toggleDarkMode, isAutoMode, toggleAutoMode } = useDarkMode();

  return (
    <>
      <div className="card p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            {isDarkMode ? (
              <ThemedIcon icon={Moon} variant="section" />
            ) : (
              <ThemedIcon icon={Sun} variant="section" />
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('settings.darkMode')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('settings.darkModeDesc')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleDarkMode}
            disabled={isAutoMode}
            className={`relative flex-shrink-0 h-8 w-14 items-center rounded-full transition-colors inline-flex ${
              isAutoMode ? 'opacity-50 cursor-not-allowed' : ''
            } ${isDarkMode ? 'bg-gradient-to-r from-brand-primary to-brand-secondary' : 'bg-gray-300'}`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                isDarkMode ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="card p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <ThemedIcon icon={Globe} variant="section" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('settings.autoDarkMode')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('settings.autoDarkModeDesc')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleAutoMode}
            className={`relative flex-shrink-0 h-8 w-14 items-center rounded-full transition-colors inline-flex ${
              isAutoMode ? 'bg-gradient-to-r from-brand-primary to-brand-secondary' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                isAutoMode ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </>
  );
}
