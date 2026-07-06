import { getMascot } from '../../lib/mascotConstants';
import { getMascotStageId } from '../../lib/mascotPresentation';

/**
 * Pool-deck stage for the coach mascot — backdrop varies per mascot personality.
 */
export default function MascotStage({ children, className = '', compact = false, mascotId = 'flip' }) {
  const stageId = getMascotStageId(mascotId);
  const stageBg = getMascot(stageId).stageBg;

  return (
    <div
      className={`mascot-stage mascot-stage--${stageId} relative overflow-hidden ${compact ? 'rounded-xl' : 'rounded-2xl'} ${className}`}
    >
      {stageBg && (
        <div
          className="mascot-stage-photo"
          style={{ backgroundImage: `url(${stageBg})` }}
          aria-hidden="true"
        />
      )}
      <div className={`mascot-stage-overlay mascot-stage-overlay--${stageId}`} aria-hidden="true" />
      <div className={`mascot-stage-glow mascot-stage-glow--${stageId}`} aria-hidden="true" />
      <div className={`mascot-stage-decor mascot-stage-decor--${stageId}`} aria-hidden="true" />
      <div className={`mascot-stage-bubbles mascot-stage-bubbles--${stageId}`} aria-hidden="true">
        <span className="mascot-bubble mascot-bubble-a" />
        <span className="mascot-bubble mascot-bubble-b" />
        <span className="mascot-bubble mascot-bubble-c" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
