import { Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/UserPreferencesContext';
import { useSwim } from '../../context/SwimContext';
import { getStoreItem } from '../../lib/swimCoinStore';

export default function StoreCosmeticsPanel() {
  const { t } = useLanguage();
  const { profile, storeUnlocks, updateProfile } = useSwim();

  const ownedAmbients = storeUnlocks.filter((id) => id.startsWith('ambient:'));
  const ownedTitles = storeUnlocks.filter((id) => id.startsWith('title:'));

  if (ownedAmbients.length === 0 && ownedTitles.length === 0) return null;

  return (
    <div className="card p-6 mt-4 border border-brand-primary/15 bg-gradient-to-br from-brand-primary/[0.04] to-transparent">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={18} className="text-brand-primary" />
        <h3 className="text-lg font-bold text-ink dark:text-gray-100">
          {t('settings.storeCosmeticsTitle')}
        </h3>
      </div>
      <p className="text-sm text-ink-soft mb-5">{t('settings.storeCosmeticsDesc')}</p>

      {ownedAmbients.length > 0 && (
        <div className="mb-5">
          <label className="block text-sm font-medium text-ink-soft mb-2">
            {t('settings.activeAmbient')}
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => updateProfile({ activeAmbient: null })}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                !profile.activeAmbient
                  ? 'border-brand bg-tint-soft text-[#2A45CC] dark:bg-tint/15'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-black/5'
              }`}
            >
              {t('settings.ambientDefault')}
            </button>
            {ownedAmbients.map((id) => {
              const item = getStoreItem(id);
              const active = profile.activeAmbient === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => updateProfile({ activeAmbient: id })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                    active
                      ? 'border-brand bg-tint-soft text-[#2A45CC] dark:bg-tint/15'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-black/5'
                  }`}
                >
                  {item ? t(item.nameKey) : id}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {ownedTitles.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-ink-soft mb-2">
            {t('settings.swimmerTitle')}
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => updateProfile({ swimmerTitle: null })}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                !profile.swimmerTitle
                  ? 'border-brand bg-tint-soft text-[#2A45CC] dark:bg-tint/15'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-black/5'
              }`}
            >
              {t('settings.titleNone')}
            </button>
            {ownedTitles.map((id) => {
              const item = getStoreItem(id);
              const active = profile.swimmerTitle === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => updateProfile({ swimmerTitle: id })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                    active
                      ? 'border-brand bg-tint-soft text-[#2A45CC] dark:bg-tint/15'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-black/5'
                  }`}
                >
                  {item ? t(item.nameKey) : id}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
