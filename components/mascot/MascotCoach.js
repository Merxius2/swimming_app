import MascotCharacter from './MascotCharacter';
import MascotLevelBadge from './MascotLevelBadge';
import MascotSpeechBubble from './MascotSpeechBubble';
import MascotStage from './MascotStage';

/**
 * Swim-coach mascot with stage, speech bubble, and level badge.
 */
export default function MascotCoach({
  message = '',
  sex = 'male',
  level = 'intermediate',
  look = 'coach',
  bubbleTone = 'default',
  coachName = '',
  showLevelBadge = true,
  showStage = true,
  size = 220,
  animated = true,
  className = '',
  bubbleClassName = '',
}) {
  const displayName = coachName;

  const content = (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {displayName && (
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
          {displayName}
        </p>
      )}

      <MascotSpeechBubble
        message={message}
        tone={bubbleTone}
        className={bubbleClassName}
      />

      <div className="flex flex-col items-center gap-2">
        {showLevelBadge && (
          <MascotLevelBadge level={level} />
        )}
        <MascotCharacter
          sex={sex}
          level={level}
          look={look}
          size={size}
          animated={animated}
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
