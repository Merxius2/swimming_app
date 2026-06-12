import { Palette } from 'lucide-react';
import { useLanguage, useTheme } from '../../context/UserPreferencesContext';
import ThemedIcon from '../ThemedIcon';

export default function ThemeSettings() {
  const { t } = useLanguage();
  const { theme, changeTheme, THEMES } = useTheme();

  return (
    <div className="card p-8">
      <div className="flex items-center gap-3 mb-6">
        <ThemedIcon icon={Palette} variant="section" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('settings.theme')}</h2>
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-6">{t('settings.themeDesc')}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {THEMES.map((item) => {
          const isSelected = theme === item.code;

          return (
            <button
              key={item.code}
              type="button"
              onClick={() => changeTheme(item.code)}
              className={`flex flex-col gap-4 rounded-lg p-5 text-left transition-all ${
                isSelected
                  ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-lg ring-2 ring-brand-primary/40'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div
                className="h-16 w-full rounded-md border border-black/[0.08] overflow-hidden flex"
                style={
                  item.previewStyle === 'flat'
                    ? undefined
                    : {
                        background: `linear-gradient(135deg, ${item.preview.from} 0%, ${item.preview.via} 55%, ${item.preview.to} 100%)`,
                      }
                }
              >
                {item.previewStyle === 'flat' && (
                  <>
                    <span className="flex-1" style={{ background: item.preview.from }} />
                    <span className="flex-1" style={{ background: item.preview.via }} />
                    {item.preview.quaternary && (
                      <span className="flex-1" style={{ background: item.preview.quaternary }} />
                    )}
                    <span className="flex-1" style={{ background: item.preview.to }} />
                  </>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">{t(item.nameKey)}</p>
                <p className={`mt-1 text-xs ${isSelected ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
                  {t(item.descKey)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
