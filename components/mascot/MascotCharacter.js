import { useEffect, useRef, useState } from 'react';
import { getMascotCharacter } from '../../lib/mascotConstants';

/**
 * Renders Flip or Flo as full-body artwork with a natural blink cycle
 * (open/closed eye frames) and a gentle CSS idle animation.
 *
 * `size` is the rendered height in pixels.
 */
export default function MascotCharacter({
  sex = 'male',
  animated = true,
  className = '',
  size = 220,
}) {
  const [blinking, setBlinking] = useState(false);
  const timersRef = useRef([]);
  const character = getMascotCharacter(sex);

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
          // occasional quick double blink for a lively feel
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
  }, [animated, sex]);

  return (
    <div
      className={`relative mx-auto ${animated ? 'mascot-alive' : ''} ${className}`}
      style={{ width, height }}
      data-mascot={character.id}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={character.images.open}
        alt=""
        className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
        style={{ opacity: blinking ? 0 : 1 }}
        draggable={false}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={character.images.closed}
        alt=""
        className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
        style={{ opacity: blinking ? 1 : 0 }}
        aria-hidden="true"
        draggable={false}
      />
    </div>
  );
}
