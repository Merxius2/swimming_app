import { useEffect, useRef, useState } from 'react';
import { getMascot } from '../../lib/mascotConstants';

/**
 * Renders Flip, Flo, or Fins as full-body artwork with a natural blink
 * cycle (open/closed eye frames) and a gentle CSS idle animation.
 *
 * `size` is the rendered height in pixels.
 * `mood` — `happy` (default) or `disappointed` for slower / critical sessions.
 */
export default function MascotCharacter({
  mascotId = 'flip',
  mood = 'happy',
  animated = true,
  className = '',
  size = 220,
}) {
  const [blinking, setBlinking] = useState(false);
  const timersRef = useRef([]);
  const character = getMascot(mascotId);
  const disappointed = mood === 'disappointed' && character.images.disappointedOpen;

  const openSrc = disappointed ? character.images.disappointedOpen : character.images.open;
  const closedSrc = disappointed && character.images.disappointedClosed
    ? character.images.disappointedClosed
    : character.images.closed;

  const height = size;
  const width = Math.round(size * character.aspect);

  useEffect(() => {
    setBlinking(false);
    if (!animated) return undefined;

    const timers = timersRef.current;
    const clearAll = () => {
      timers.forEach(clearTimeout);
      timers.length = 0;
    };

    const scheduleBlink = () => {
      const delay = 2600 + Math.random() * 2600;
      timers.push(setTimeout(() => {
        setBlinking(true);
        timers.push(setTimeout(() => {
          setBlinking(false);
          if (Math.random() < 0.25) {
            timers.push(setTimeout(() => {
              setBlinking(true);
              timers.push(setTimeout(() => {
                setBlinking(false);
                scheduleBlink();
              }, 130));
            }, 140));
          } else {
            scheduleBlink();
          }
        }, 150));
      }, delay));
    };

    scheduleBlink();
    return clearAll;
  }, [animated, mascotId, mood]);

  return (
    <div
      className={`relative mx-auto ${animated ? 'mascot-alive' : ''} ${disappointed ? 'mascot-alive--disappointed' : ''} ${className}`}
      style={{ width, height }}
      data-mascot={character.id}
      data-mascot-mood={mood}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={openSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
        style={{ opacity: blinking ? 0 : 1 }}
        draggable={false}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={closedSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
        style={{ opacity: blinking ? 1 : 0 }}
        aria-hidden="true"
        draggable={false}
      />
    </div>
  );
}
