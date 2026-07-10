/**
 * Classify generated feedback insight lines for mascot filtering (e.g. Flip positive-only).
 * Negative patterns are checked first so "slower" does not match the "lower" positive rule.
 */
const NEGATIVE_INSIGHT_RE = /\b(slower|shorter|under goal|under your|dipped a little|critical|below your standard|langzamer|korter|onder je|langzamer|yavaş|медленнее|-\d+%)\b/i;

const POSITIVE_INSIGHT_RE = /\b(faster|sneller|longer|langer|record|streak|reeks|быстрее|hızlı|daha hızlı|improv|percentile|personal best|hit your|over your|above|trending faster|trend improv|calories burned|sustained output|sessions in the last)\b/i;

const POSITIVE_LOWER_RE = /\b(lower|lager)\b/i;

export const isPositiveInsight = (insight) => {
  if (!insight?.trim()) return false;
  if (NEGATIVE_INSIGHT_RE.test(insight)) return false;
  if (POSITIVE_INSIGHT_RE.test(insight)) return true;
  if (POSITIVE_LOWER_RE.test(insight) && !/\bslow/i.test(insight)) return true;
  if (/\b(over|boven)\b/i.test(insight) && /\b(goal|doel)\b/i.test(insight)) return true;
  return false;
};
