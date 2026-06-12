import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/UserPreferencesContext';
import { LANGUAGES } from '../../lib/appConstants';
import ThemedIcon from '../ThemedIcon';

export default function LanguageSettings() {
  const { t, language, changeLanguage } = useLanguage();

  return (
    <div className="card p-8">
      <div className="flex items-center gap-3 mb-6">
        <ThemedIcon icon={Globe} variant="section" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('settings.language')}</h2>
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-6">{t('settings.languageDesc')}</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => changeLanguage(lang.code)}
            className={`flex flex-col items-center gap-3 rounded-lg p-6 transition-all ${
              language === lang.code
                ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-lg'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span className="text-3xl font-semibold">{lang.flag}</span>
            <span className="text-xs font-medium text-center">{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
