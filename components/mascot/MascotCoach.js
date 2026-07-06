import MascotCharacter from './MascotCharacter';
import MascotLevelBadge from './MascotLevelBadge';
import MascotSpeechBubble from './MascotSpeechBubble';
import MascotStage from './MascotStage';

/**
 * Flip/Flo swim coach: character with speech bubble, name, and level badge.
 * Stacks vertically on small screens, side-by-side from `sm` upward.
 */
export default function MascotCoach({
  message = '',
  sex = 'male',
  level = 'intermediate',
  bubbleTone = 'default',
  coachName = '',
  showLevelBadge = true,
  showStage = true,
  size = 220,
  animated = true,
  className = '',
}) {
  const content = (
    <div className={`flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 ${className}`}>
      <div className="order-2 sm:order-1 shrink-0 flex flex-col items-center mascot-enter">
        <MascotCharacter sex={sex} size={size} animated={animated} />
        <div className="mascot-shadow" aria-hidden="true" />
      </div>

      <div className="order-1 sm:order-2 flex-1 min-w-0 w-full flex flex-col items-center sm:items-start gap-2 sm:pb-8">
        {(coachName || showLevelBadge) && (
          <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
            {coachName && (
              <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                {coachName}
              </p>
            )}
            {showLevelBadge && <MascotLevelBadge level={level} />}
          </div>
        )}

        <MascotSpeechBubble
          message={message}
          tone={bubbleTone}
          tail="left"
          className="w-full max-w-md hidden sm:block"
        />
        <MascotSpeechBubble
          message={message}
          tone={bubbleTone}
          tail="bottom"
          className="w-full max-w-md sm:hidden"
        />
      </div>
    </div>
  );

  if (!showStage) return content;

  return (
    <MascotStage className="px-4 py-5 sm:px-6 sm:py-6">
      {content}
    </MascotStage>
  );
}
