import { Medal, Trophy, Waves } from 'lucide-react';
import { useLanguage } from '../../context/UserPreferencesContext';
import { getMascotLevelMeta } from '../../lib/mascotPresentation';

const ACCENT_CLASS = {
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50',
  brand: 'bg-tint-soft text-[#2A45CC] border-brand/25 dark:bg-tint/15 dark:text-[#C8D2FF] dark:border-brand/30',
  violet: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800/50',
};

const LEVEL_ICON = {
  beginner: Waves,
  intermediate: Medal,
  advanced: Trophy,
};

export default function MascotLevelBadge({ level = 'intermediate', className = '' }) {
  const { t } = useLanguage();
  const meta = getMascotLevelMeta(level);
  const accent = ACCENT_CLASS[meta.accent] || ACCENT_CLASS.brand;
  const Icon = LEVEL_ICON[level] || Medal;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${accent} ${className}`}
    >
      <Icon size={13} strokeWidth={2.5} />
      {t(meta.labelKey)}
    </span>
  );
}
