/**
 * Flip/Flo coach mascots — artwork cropped from variants-animation.png
 * with blink frames from the character sheet.
 */

import { useEffect, useState } from 'react';

const COACH_IMAGE = {
  coach: {
    male: '/mascot/flip-coach.png',
    female: '/mascot/flo-coach.png',
  },
  classic: {
    male: '/mascot/flip-team.png',
    female: '/mascot/flo-coach.png',
  },
};

const BLINK_FRAMES = [
  '/mascot/flip-blink-0.png',
  '/mascot/flip-blink-1.png',
  '/mascot/flip-blink-2.png',
  '/mascot/flip-blink-3.png',
];

const ZOOM = 1.85;
const ASPECT = 1.12;

function resolveMascotAsset(sex, look = 'coach') {
  const isFemale = sex === 'female';
  const resolvedLook = look === 'classic' ? 'classic' : 'coach';

  return {
    src: COACH_IMAGE[resolvedLook][isFemale ? 'female' : 'male'],
    zoom: ZOOM,
    aspect: ASPECT,
    blink: true,
  };
}

export default function MascotCharacter({
  sex = 'male',
  level = 'intermediate',
  look = 'coach',
  blink = false,
  animated = true,
  className = '',
  size = 220,
}) {
  const [blinkFrame, setBlinkFrame] = useState(-1);
  const asset = resolveMascotAsset(sex, look);

  const viewW = size;
  const viewH = Math.round(size * ASPECT);
  const artW = Math.round(viewW * asset.zoom);

  useEffect(() => {
    if (!animated || !asset.blink) {
      setBlinkFrame(-1);
      return undefined;
    }

    let blinkTimeout;
    let frameInterval;
    let openTimeout;
    let cycleInterval;

    const runBlink = () => {
      let frame = 0;
      setBlinkFrame(0);
      frameInterval = setInterval(() => {
        frame += 1;
        if (frame < BLINK_FRAMES.length) {
          setBlinkFrame(frame);
        } else {
          clearInterval(frameInterval);
          openTimeout = setTimeout(() => setBlinkFrame(-1), 40);
        }
      }, 45);
    };

    const scheduleBlink = () => {
      const delay = 2200 + Math.random() * 2800;
      blinkTimeout = setTimeout(runBlink, delay);
    };

    scheduleBlink();
    cycleInterval = setInterval(() => {
      clearTimeout(blinkTimeout);
      clearInterval(frameInterval);
      clearTimeout(openTimeout);
      setBlinkFrame(-1);
      scheduleBlink();
    }, 5200);

    return () => {
      clearTimeout(blinkTimeout);
      clearInterval(frameInterval);
      clearTimeout(openTimeout);
      clearInterval(cycleInterval);
    };
  }, [animated, asset.blink]);

  const isBlinking = blink || blinkFrame >= 0;

  return (
    <div
      className={`relative overflow-hidden mx-auto ${className}`}
      style={{ width: viewW, height: viewH }}
      data-mascot-level={level}
    >
      <div
        className="absolute left-1/2 bottom-0 -translate-x-1/2"
        style={{ width: artW }}
      >
        <div className={`relative ${animated ? 'mascot-alive' : ''}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset.src}
            alt=""
            className="w-full h-auto block select-none pointer-events-none"
            draggable={false}
          />

          {asset.blink && isBlinking && blinkFrame >= 0 && (
            <div
              className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
              style={{ top: '2%', width: '72%' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={BLINK_FRAMES[blinkFrame]}
                alt=""
                className="w-full h-auto block select-none"
                draggable={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
