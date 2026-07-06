/** Speech bubble tone — matches variants on the character sheet demo. */
export const MASCOT_BUBBLE_TONES = ['default', 'reward', 'tip', 'levelUp', 'thinking'];

export const MASCOT_LEVEL_META = {
  beginner: {
    labelKey: 'benchmark.levels.beginner',
    descKey: 'mascot.levelBeginnerDesc',
    accent: 'emerald',
    icon: '/mascot/level-beginner-icon.png',
  },
  intermediate: {
    labelKey: 'benchmark.levels.intermediate',
    descKey: 'mascot.levelIntermediateDesc',
    accent: 'brand',
    icon: '/mascot/level-intermediate-icon.png',
  },
  advanced: {
    labelKey: 'benchmark.levels.advanced',
    descKey: 'mascot.levelAdvancedDesc',
    accent: 'violet',
    icon: '/mascot/level-advanced-icon.png',
  },
};

const LEVEL_UP_RE = /\b(level(?:ed)? up|leveled up|niveau|stuf|уровень|seviye)\b/i;
const REWARD_RE = /\b(coin|coins|munt|монет|record|personal best|medal|trophy|pr\b|bonus|\+[\d,.]+\s*(coin|munt))/i;

export function resolveMascotBubbleTone({
  loading = false,
  coachMessage = '',
  motivation = '',
  tip = '',
  badges = [],
  benchmarkLevel = null,
  message = '',
} = {}) {
  if (loading) return 'thinking';

  const combined = [coachMessage, motivation, tip, message].filter(Boolean).join(' ');

  if (badges?.length > 0 || REWARD_RE.test(combined)) return 'reward';
  if (tip) return 'tip';
  if (LEVEL_UP_RE.test(combined)) return 'levelUp';
  if (benchmarkLevel && benchmarkLevel !== 'unknown' && benchmarkLevel !== 'developing') {
    if (/level|niveau|stuf|уровень|seviye/i.test(combined)) return 'levelUp';
  }

  return 'default';
}

export function getMascotLevelMeta(level) {
  return MASCOT_LEVEL_META[level] || MASCOT_LEVEL_META.beginner;
}
