/**
 * Pool-deck stage for the coach mascot — inspired by design-mockup.png backdrop.
 */
export default function MascotStage({ children, className = '', compact = false }) {
  return (
    <div
      className={`mascot-stage relative overflow-hidden ${compact ? 'rounded-xl' : 'rounded-2xl'} ${className}`}
    >
      <div className="mascot-stage-glow" aria-hidden="true" />
      <div className="mascot-stage-bubbles" aria-hidden="true">
        <span className="mascot-bubble mascot-bubble-a" />
        <span className="mascot-bubble mascot-bubble-b" />
        <span className="mascot-bubble mascot-bubble-c" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
