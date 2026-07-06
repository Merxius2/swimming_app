/**
 * Raster Flip/Flo coach characters from the approved character sheet artwork,
 * with SVG overlays for blink, level accessories, and shop gear.
 */

import MascotOverlays from './MascotOverlays';

const MASCOT_IMAGE = {
  male: '/mascot/flip-coach.png',
  female: '/mascot/flo-coach.png',
};

/** PNG aspect ratio (1536×1024). */
const ASPECT = 1024 / 1536;

export default function MascotCharacter({
  sex = 'male',
  level = 'intermediate',
  blink = false,
  equipped = [],
  className = '',
  size = 160,
}) {
  const src = MASCOT_IMAGE[sex === 'female' ? 'female' : 'male'];
  const width = size;
  const height = Math.round(size * ASPECT);

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width, height }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={width}
        height={height}
        className="w-full h-full object-contain select-none"
        draggable={false}
      />
      <MascotOverlays
        sex={sex}
        level={level}
        equipped={equipped}
        blink={blink}
      />
    </div>
  );
}
