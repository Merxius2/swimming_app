import { Check, Coins, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/UserPreferencesContext';
import { useSwim } from '../../context/SwimContext';
import MascotCoach from '../mascot/MascotCoach';
import MascotCharacter from '../mascot/MascotCharacter';
import MascotLevelBadge from '../mascot/MascotLevelBadge';
import {
  MASCOT_IDS,
  MASCOTS,
  getMascot,
  getMascotCoachedLevel,
  getMascotName,
  resolveMascotId,
} from '../../lib/mascotConstants';
import { buildMascotPreviewMessage } from '../../lib/swimProfile';

function MascotChoiceCard({ mascot, active, t, onSelect }) {
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
      <MascotCharacter mascotId={mascot.id} size={120} animated={active} className="mb-3" />
      <span className="text-lg font-bold text-ink dark:text-gray-100">{t(mascot.nameKey)}</span>
      <MascotLevelBadge level={mascot.coachedLevel} className="mt-1.5" />
      <span className="flex flex-wrap justify-center gap-1.5 mt-2 mb-1.5">
        {mascot.traitKeys.map((key) => (
          <span
            key={key}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            {t(key)}
          </span>
        ))}
      </span>
      <span className="text-xs text-ink-soft leading-relaxed text-center">{t(mascot.descKey)}</span>
      {mascot.rulesKey && (
        <span className="inline-flex items-center gap-1 mt-2 text-[10px] text-ink-faint leading-relaxed text-center">
          <Coins size={11} className="shrink-0" />
          {t(mascot.rulesKey)}
        </span>
      )}
    </button>
  );
}

export default function MascotSettings() {
  const { t } = useLanguage();
  const { profile, updateProfile } = useSwim();

  const mascotId = resolveMascotId(profile);
  const mascot = getMascot(mascotId);
  const mascotName = getMascotName(mascotId, t);
  const coachedLevel = getMascotCoachedLevel(mascotId);
  const previewMessage = buildMascotPreviewMessage(mascot, profile, t);

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles size={20} className="text-brand" />
        <div>
          <h2 className="text-xl font-bold text-ink dark:text-gray-100">{t('settings.mascotTitle')}</h2>
          <p className="text-sm text-ink-soft">{t('settings.mascotDesc')}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        {MASCOT_IDS.map((id) => (
          <MascotChoiceCard
            key={id}
            mascot={MASCOTS[id]}
            active={mascotId === id}
            t={t}
            onSelect={() => updateProfile({ mascotId: id })}
          />
        ))}
      </div>

      <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
        <p className="text-sm font-medium text-ink-soft mb-3">
          {t('settings.mascotActiveCoach').replace('{name}', mascotName)}
        </p>
        <MascotCoach
          key={`${mascotId}-${profile.name}`}
          message={previewMessage}
          mascotId={mascotId}
          level={coachedLevel}
          coachName={mascotName}
          bubbleTone={mascotId === 'fins' ? 'levelUp' : 'default'}
          size={190}
          animated
          showStage
        />
      </div>
    </div>
  );
}
