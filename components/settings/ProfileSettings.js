import { useState } from 'react';
import { User } from 'lucide-react';
import { useLanguage } from '../../context/UserPreferencesContext';
import { useSwim } from '../../context/SwimContext';
import ThemedIcon from '../ThemedIcon';
import StoreCosmeticsPanel from './StoreCosmeticsPanel';
import MascotCoach from '../mascot/MascotCoach';
import { resolveMascotLevel } from '../../lib/mascotConstants';
import { getSwimLevel, getBenchmarkForProfile } from '../../lib/swimBenchmarks';
import { getStatsSessions } from '../../lib/swimAnalysis';

export default function ProfileSettings() {
  const { t } = useLanguage();
  const { profile, updateProfile, sessions } = useSwim();
  const [age, setAge] = useState(String(profile.age ?? 30));

  const statsSessions = getStatsSessions(sessions);
  const latestPace = statsSessions.length
    ? statsSessions[statsSessions.length - 1]?.metrics?.paceSecPer100m
    : null;
  const benchmark = getBenchmarkForProfile(profile.sex, profile.age);
  const swimLevel = getSwimLevel(latestPace, benchmark);
  const mascotLevel = resolveMascotLevel(swimLevel);

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
          <p className="text-xs text-ink-faint mt-1">{t('settings.mascotSexHint')}</p>
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

      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
        <p className="text-sm font-medium text-ink-soft mb-3">{t('settings.mascotPreview')}</p>
        <div className="flex justify-center py-2 rounded-xl bg-gradient-to-br from-tint/5 to-brand-accent/5">
          <MascotCoach
            message={t('settings.mascotPreviewMessage')}
            sex={profile.sex || 'male'}
            level={mascotLevel}
            equipped={profile.mascotEquipped || []}
            size={120}
            animated
          />
        </div>
      </div>

      <StoreCosmeticsPanel />
    </div>
  );
}
