import { useState } from 'react';
import { User } from 'lucide-react';
import { useLanguage } from '../../context/UserPreferencesContext';
import { useSwim } from '../../context/SwimContext';
import ThemedIcon from '../ThemedIcon';
import StoreCosmeticsPanel from './StoreCosmeticsPanel';

export default function ProfileSettings() {
  const { t } = useLanguage();
  const { profile, updateProfile } = useSwim();
  const [age, setAge] = useState(String(profile.age ?? 30));

  const handleAgeBlur = () => {
    const parsed = parseInt(age, 10);
    if (Number.isFinite(parsed) && parsed >= 10 && parsed <= 90) {
      updateProfile({ age: parsed });
    } else {
      setAge(String(profile.age ?? 30));
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <ThemedIcon icon={User} size={20} />
        <div>
          <h2 className="text-xl font-bold text-ink dark:text-gray-100">{t('settings.profileTitle')}</h2>
          <p className="text-sm text-ink-soft">{t('settings.profileDesc')}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink-soft mb-2">{t('settings.sex')}</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => updateProfile({ sex: 'male' })}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition ${
                profile.sex === 'male'
                  ? 'border-brand bg-tint-soft text-[#2A45CC] dark:bg-tint/15'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-black/5'
              }`}
            >
              <User size={18} />
              {t('settings.sexMale')}
            </button>
            <button
              type="button"
              onClick={() => updateProfile({ sex: 'female' })}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition ${
                profile.sex === 'female'
                  ? 'border-brand bg-tint-soft text-[#2A45CC] dark:bg-tint/15'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-black/5'
              }`}
            >
              <User size={18} />
              {t('settings.sexFemale')}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="profile-age" className="block text-sm font-medium text-ink-soft mb-2">
            {t('settings.age')}
          </label>
          <input
            id="profile-age"
            type="number"
            min={10}
            max={90}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            onBlur={handleAgeBlur}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          />
        </div>
      </div>
      <StoreCosmeticsPanel />
    </div>
  );
}
