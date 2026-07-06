/** Speech bubble tones — mirrors the variants on the character design sheet. */
export const MASCOT_BUBBLE_TONES = ['default', 'reward', 'tip', 'levelUp', 'thinking'];

export const MASCOT_LEVEL_META = {
  beginner: {
    labelKey: 'benchmark.levels.beginner',
    accent: 'emerald',
  },
  intermediate: {
    labelKey: 'benchmark.levels.intermediate',
    accent: 'brand',
  },
  advanced: {
    labelKey: 'benchmark.levels.advanced',
    accent: 'violet',
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
