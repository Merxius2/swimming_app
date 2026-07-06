import { Check, Coins, Lock, Sparkles } from 'lucide-react';
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
import {
  canSwitchMascot,
  getMascotUnlockStatus,
  MASCOT_UNLOCK_REQUIREMENTS,
} from '../../lib/mascotUnlock';
import { getMonthKey } from '../../lib/swimMonthlyChallenges';
import { buildMascotPreviewMessage } from '../../lib/swimProfile';

function getUnlockHint(mascotId, unlockStatus, t) {
  const requirements = MASCOT_UNLOCK_REQUIREMENTS[mascotId];
  if (!requirements?.minPaceLevel) return null;

  if (unlockStatus.unlocked) return null;

  const paceLabel = t(`benchmark.levels.${requirements.minPaceLevel}`);
  return t('settings.mascotUnlockHint')
    .replace('{pace}', paceLabel)
    .replace('{medals}', String(requirements.minMonthlyMedals));
}

function MascotChoiceCard({
  mascot,
  active,
  locked,
  disabled,
  unlockHint,
  t,
  onSelect,
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={active}
      className={`relative flex flex-col items-center p-4 rounded-xl border transition w-full ${
        disabled
          ? 'border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed'
          : active
            ? 'border-brand bg-tint-soft ring-2 ring-brand/30 dark:bg-tint/15'
            : 'border-gray-200 dark:border-gray-700 hover:bg-black/5 dark:hover:bg-white/5'
      }`}
    >
      {active && !locked && (
        <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center">
          <Check size={14} strokeWidth={3} />
        </span>
      )}
      {locked && (
        <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-gray-500 text-white flex items-center justify-center">
          <Lock size={12} strokeWidth={3} />
        </span>
      )}
      <MascotCharacter mascotId={mascot.id} size={120} animated={active && !locked} className="mb-3" />
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
      {unlockHint && (
        <span className="mt-2 text-[10px] text-amber-700 dark:text-amber-300 leading-relaxed text-center">
          {unlockHint}
        </span>
      )}
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
  const { profile, sessions, monthlyChallengeRerolls, switchMascot } = useSwim();

  const monthKey = getMonthKey();
  const unlockContext = { profile, sessions, monthlyChallengeRerolls };
  const mascotId = resolveMascotId(profile, unlockContext);
  const mascot = getMascot(mascotId);
  const mascotName = getMascotName(mascotId, t);
  const coachedLevel = getMascotCoachedLevel(mascotId);
  const previewMessage = buildMascotPreviewMessage(mascot, profile, t);

  const switchWindow = canSwitchMascot({
    profile,
    sessions,
    monthKey,
    currentMascotId: mascotId,
    nextMascotId: mascotId,
  });

  const switchBlockedReason = (() => {
    if (profile?.mascotSwitchMonthKey === monthKey) {
      return 'alreadySwitched';
    }
    if (switchWindow.reason === 'afterFirstSession') {
      return 'afterFirstSession';
    }
    return null;
  })();

  const handleSelect = (id) => {
    switchMascot(id);
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles size={20} className="text-brand" />
        <div>
          <h2 className="text-xl font-bold text-ink dark:text-gray-100">{t('settings.mascotTitle')}</h2>
          <p className="text-sm text-ink-soft">{t('settings.mascotDesc')}</p>
        </div>
      </div>

      {switchBlockedReason && (
        <p className="mb-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
          {t(`settings.mascotSwitchBlocked.${switchBlockedReason}`)}
        </p>
      )}

      {!switchBlockedReason && (
        <p className="mb-4 text-sm text-ink-soft">{t('settings.mascotSwitchHint')}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        {MASCOT_IDS.map((id) => {
          const unlockStatus = getMascotUnlockStatus(id, unlockContext);
          const locked = !unlockStatus.unlocked;
          const switchCheck = canSwitchMascot({
            profile,
            sessions,
            monthKey,
            currentMascotId: mascotId,
            nextMascotId: id,
          });
          const disabled = locked || !switchCheck.allowed;

          return (
            <MascotChoiceCard
              key={id}
              mascot={MASCOTS[id]}
              active={mascotId === id}
              locked={locked}
              disabled={disabled}
              unlockHint={getUnlockHint(id, unlockStatus, t)}
              t={t}
              onSelect={() => handleSelect(id)}
            />
          );
        })}
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
