import { Check, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/UserPreferencesContext';
import { useSwim } from '../../context/SwimContext';
import MascotCoach from '../mascot/MascotCoach';
import MascotCharacter from '../mascot/MascotCharacter';
import {
  getMascotName,
  resolveMascotLevel,
  resolveMascotSex,
} from '../../lib/mascotConstants';
import { getSwimLevel, getBenchmarkForProfile } from '../../lib/swimBenchmarks';
import { getStatsSessions } from '../../lib/swimAnalysis';

function MascotChoiceCard({ sex, active, name, description, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`relative flex flex-col items-center p-4 rounded-xl border transition w-full ${
        active
          ? 'border-brand bg-tint-soft ring-2 ring-brand/30 dark:bg-tint/15'
          : 'border-gray-200 dark:border-gray-700 hover:bg-black/5 dark:hover:bg-white/5'
      }`}
    >
      {active && (
        <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center">
          <Check size={14} strokeWidth={3} />
        </span>
      )}
      <MascotCharacter sex={sex} size={120} animated={active} className="mb-3" />
      <span className="text-lg font-bold text-ink dark:text-gray-100">{name}</span>
      <span className="text-xs text-ink-soft mt-1 leading-relaxed text-center">{description}</span>
    </button>
  );
}

export default function MascotSettings() {
  const { t } = useLanguage();
  const { profile, updateProfile, sessions } = useSwim();

  const mascotSex = resolveMascotSex(profile);
  const mascotName = getMascotName(mascotSex, t);

  const statsSessions = getStatsSessions(sessions);
  const latestPace = statsSessions.length
    ? statsSessions[statsSessions.length - 1]?.metrics?.paceSecPer100m
    : null;
  const benchmark = getBenchmarkForProfile(profile.sex, profile.age);
  const swimLevel = getSwimLevel(latestPace, benchmark);
  const mascotLevel = resolveMascotLevel(swimLevel);

  const previewMessage = t('settings.mascotPreviewMessage').replace('{name}', mascotName);

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles size={20} className="text-brand" />
        <div>
          <h2 className="text-xl font-bold text-ink dark:text-gray-100">{t('settings.mascotTitle')}</h2>
          <p className="text-sm text-ink-soft">{t('settings.mascotDesc')}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 mb-6">
        <MascotChoiceCard
          sex="male"
          active={mascotSex === 'male'}
          name={t('settings.mascotFlipName')}
          description={t('settings.mascotFlipDesc')}
          onSelect={() => updateProfile({ mascotSex: 'male' })}
        />
        <MascotChoiceCard
          sex="female"
          active={mascotSex === 'female'}
          name={t('settings.mascotFloName')}
          description={t('settings.mascotFloDesc')}
          onSelect={() => updateProfile({ mascotSex: 'female' })}
        />
      </div>

      <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
        <p className="text-sm font-medium text-ink-soft mb-3">
          {t('settings.mascotActiveCoach').replace('{name}', mascotName)}
        </p>
        <MascotCoach
          key={mascotSex}
          message={previewMessage}
          sex={mascotSex}
          level={mascotLevel}
          coachName={mascotName}
          bubbleTone="default"
          size={190}
          animated
          showStage
        />
      </div>
    </div>
  );
}
