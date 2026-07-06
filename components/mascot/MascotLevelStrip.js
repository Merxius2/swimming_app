import { useLanguage } from '../../context/UserPreferencesContext';
import { MASCOT_LEVEL_META } from '../../lib/mascotPresentation';

const LEVELS = ['beginner', 'intermediate', 'advanced'];

const ACTIVE_RING = {
  beginner: 'ring-emerald-400/60 border-emerald-300/50',
  intermediate: 'ring-brand/50 border-brand/40',
  advanced: 'ring-violet-400/60 border-violet-300/50',
};

export default function MascotLevelStrip({ activeLevel = 'intermediate', className = '' }) {
  const { t } = useLanguage();

  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      {LEVELS.map((level) => {
        const meta = MASCOT_LEVEL_META[level];
        const active = activeLevel === level;
        return (
          <div
            key={level}
            className={`rounded-xl border p-2 text-center transition ${
              active
                ? `bg-white/70 dark:bg-gray-900/50 shadow-sm ring-2 ${ACTIVE_RING[level]}`
                : 'bg-white/35 dark:bg-gray-900/20 border-white/30 dark:border-white/10 opacity-80'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={meta.icon}
              alt=""
              className="w-12 h-12 mx-auto object-contain mb-1.5"
            />
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink dark:text-gray-100 leading-tight">
              {t(meta.labelKey)}
            </p>
            <p className="text-[9px] text-ink-soft mt-0.5 leading-snug hidden sm:block">
              {t(meta.descKey)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
