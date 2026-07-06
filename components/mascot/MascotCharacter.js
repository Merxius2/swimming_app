/**
 * Raster Flip/Flo coach characters with zoom crop, transparency, and idle animation.
 */

import { useEffect, useState } from 'react';
import MascotOverlays from './MascotOverlays';

const MASCOT_IMAGE = {
  male: '/mascot/flip-coach.png',
  female: '/mascot/flo-coach.png',
};

/** How much to scale the artwork inside the viewport (zoom on character). */
const ZOOM = 1.85;

export default function MascotCharacter({
  sex = 'male',
  level = 'intermediate',
  blink = false,
  equipped = [],
  animated = true,
  className = '',
  size = 220,
}) {
  const [blinkPhase, setBlinkPhase] = useState(false);
  const src = MASCOT_IMAGE[sex === 'female' ? 'female' : 'male'];

  const viewW = size;
  const viewH = Math.round(size * 1.12);
  const artW = Math.round(viewW * ZOOM);

  useEffect(() => {
    if (!animated) return undefined;

    let blinkTimeout;
    let openTimeout;
    let interval;

    const scheduleBlink = () => {
      const delay = 2200 + Math.random() * 2800;
      blinkTimeout = setTimeout(() => {
        setBlinkPhase(true);
        openTimeout = setTimeout(() => setBlinkPhase(false), 120);
      }, delay);
    };

    scheduleBlink();
    interval = setInterval(() => {
      clearTimeout(blinkTimeout);
      clearTimeout(openTimeout);
      scheduleBlink();
    }, 5000);

    return () => {
      clearTimeout(blinkTimeout);
      clearTimeout(openTimeout);
      clearInterval(interval);
    };
  }, [animated]);

  const isBlinking = blink || blinkPhase;

  return (
    <div
      className={`relative overflow-hidden mx-auto ${className}`}
      style={{ width: viewW, height: viewH }}
    >
      <div
        className="absolute left-1/2 bottom-0 -translate-x-1/2"
        style={{ width: artW }}
      >
        <div className={`relative ${animated ? 'mascot-alive' : ''}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="w-full h-auto block select-none pointer-events-none"
            draggable={false}
          />
          <MascotOverlays
            sex={sex}
            level={level}
            equipped={equipped}
            blink={isBlinking}
          />
        </div>
      </div>
    </div>
  );
}
