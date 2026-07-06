import { getMascotGameplay } from './mascotConstants.js';

export const MASCOT_MOODS = ['happy', 'disappointed'];

/**
 * Pick mascot expression for session feedback.
 * Flip always stays happy; Flo/Fins react on slower sessions.
 */
export function resolveSessionMascotMood({
  mascotId,
  isFirst = false,
  hasPb = false,
  paceDeltaVsPrevious = null,
  usedCriticalCoachLine = false,
  usedPaceDownMotivation = false,
}) {
  if (isFirst || hasPb) return 'happy';

  const gameplay = getMascotGameplay(mascotId);
  const delta = paceDeltaVsPrevious;

  if (gameplay.positiveOnly) {
    // Flip stays cheerful — no disappointed expression
    return 'happy';
  }

  if (gameplay.sessionPenalty) {
    // Fins: stern when slow or when critical copy was chosen
    if (usedCriticalCoachLine || usedPaceDownMotivation) return 'disappointed';
    if (delta != null && delta <= -5) return 'disappointed';
    return 'happy';
  }

  // Flo: honest but fair
  if (usedPaceDownMotivation || (delta != null && delta <= -5)) {
    return 'disappointed';
  }

  return 'happy';
}
