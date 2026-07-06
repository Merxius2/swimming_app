/**
 * Accessory overlays drawn on top of the raster Flip/Flo coach artwork.
 * Coordinates use a 100×140 viewBox aligned to the character PNG.
 */

import { isMascotItemForSex } from '../../lib/mascotConstants';

const LEVEL_STYLES = {
  beginner: { accessory: 'floaties' },
  intermediate: { accessory: 'goggles' },
  advanced: { accessory: 'medal' },
};

function SwimmerGlyph({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <circle cx="3" cy="2" r="1.6" fill="#fff" />
      <path d="M3 3.5 C5 4.5, 6 7, 4.5 9" stroke="#fff" strokeWidth="0.8" fill="none" />
    </g>
  );
}

function OverlayFloaties() {
  return (
    <>
      <ellipse cx="18" cy="72" rx="9" ry="5" fill="#60A5FA" stroke="#2563EB" strokeWidth="0.8" />
      <ellipse cx="82" cy="72" rx="9" ry="5" fill="#60A5FA" stroke="#2563EB" strokeWidth="0.8" />
    </>
  );
}

function OverlayGoggles({ color = '#3B5BFF' }) {
  return (
    <>
      <path d="M30 28 Q50 24 70 28" stroke={color} strokeWidth="1.2" fill="none" opacity="0.6" />
      <ellipse cx="38" cy="30" rx="7" ry="5.5" fill="#111827" opacity="0.85" />
      <ellipse cx="62" cy="30" rx="7" ry="5.5" fill="#111827" opacity="0.85" />
      <ellipse cx="38" cy="30" rx="7" ry="5.5" fill="none" stroke="#9CA3AF" strokeWidth="0.8" />
      <ellipse cx="62" cy="30" rx="7" ry="5.5" fill="none" stroke="#9CA3AF" strokeWidth="0.8" />
    </>
  );
}

function OverlayMedal() {
  return (
    <>
      <circle cx="50" cy="58" r="6" fill="#F5A623" stroke="#CA8A04" strokeWidth="0.8" />
      <text x="50" y="60.5" textAnchor="middle" fontSize="5" fontWeight="800" fill="#92400E">1</text>
    </>
  );
}

function OverlayNeonCap() {
  return (
    <path
      d="M28 24 C28 12, 38 6, 50 6 C62 6, 72 12, 72 24 C72 27, 68 28, 50 28 C32 28, 28 27, 28 24 Z"
      fill="#00E5FF"
      stroke="#7C3AED"
      strokeWidth="1"
    />
  );
}

function OverlayPartyHat() {
  return (
    <>
      <path d="M38 22 L50 4 L62 22 Z" fill="#F472B6" stroke="#DB2777" strokeWidth="0.6" />
      <circle cx="50" cy="4" r="2.5" fill="#FDE047" />
    </>
  );
}

function OverlayGoldGoggles() {
  return (
    <>
      <ellipse cx="38" cy="30" rx="8" ry="6" fill="#FDE047" stroke="#CA8A04" strokeWidth="0.8" />
      <ellipse cx="62" cy="30" rx="8" ry="6" fill="#FDE047" stroke="#CA8A04" strokeWidth="0.8" />
      <ellipse cx="38" cy="30" rx="5" ry="3.5" fill="#111827" opacity="0.6" />
      <ellipse cx="62" cy="30" rx="5" ry="3.5" fill="#111827" opacity="0.6" />
    </>
  );
}

function OverlaySnorkel() {
  return (
    <>
      <path d="M68 20 C76 20, 80 32, 78 44" fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="78" cy="44" r="2" fill="#FB923C" />
    </>
  );
}

function OverlayMedalChain() {
  return (
    <>
      <path d="M42 50 Q50 56 58 50" fill="none" stroke="#CA8A04" strokeWidth="1" />
      <circle cx="50" cy="58" r="5.5" fill="#F5A623" stroke="#CA8A04" strokeWidth="0.8" />
    </>
  );
}

function OverlayCape() {
  return (
    <path
      d="M22 52 C14 54, 12 78, 18 96 C30 84, 38 78, 50 76 C62 78, 70 84, 82 96 C88 78, 86 54, 78 52 C72 62, 62 66, 50 66 C38 66, 28 62, 22 52 Z"
      fill="#7C3AED"
      stroke="#5B21B6"
      strokeWidth="0.8"
      opacity="0.92"
    />
  );
}

function OverlaySuitClassic() {
  return (
    <path d="M32 48 L30 96 Q50 100 70 96 L68 48 Q50 44 32 48 Z" fill="#3B5BFF" stroke="#2A45CC" strokeWidth="0.8" />
  );
}

function OverlaySuitRacing() {
  return (
    <>
      <path d="M34 50 L32 98 Q50 102 68 98 L66 50 Q50 46 34 50 Z" fill="#0F172A" />
      <path d="M50 50 L50 98" stroke="#EF4444" strokeWidth="1.5" />
    </>
  );
}

function OverlaySuitTropical() {
  return (
    <>
      <path d="M32 48 L30 96 Q50 100 70 96 L68 48 Q50 44 32 48 Z" fill="#0D9488" />
      <circle cx="42" cy="72" r="3" fill="#FB7185" />
      <circle cx="58" cy="80" r="2.5" fill="#FBBF24" />
    </>
  );
}

function OverlayShortsClassic() {
  return (
    <path d="M30 68 L28 96 Q50 100 72 96 L70 68 Q50 72 30 68 Z" fill="#1E3A8A" stroke="#1E40AF" strokeWidth="0.8" />
  );
}

function OverlayShortsJammer() {
  return (
    <path d="M32 62 L30 100 Q50 104 70 100 L68 62 Q50 66 32 62 Z" fill="#0F172A" stroke="#3B82F6" strokeWidth="1" />
  );
}

function OverlayShortsSunset() {
  return (
    <path d="M30 68 L28 96 Q50 100 72 96 L70 68 Q50 72 30 68 Z" fill="#F97316" stroke="#EA580C" strokeWidth="0.8" />
  );
}

const ITEM_OVERLAYS = {
  'mascot:neon-cap': { render: OverlayNeonCap, layer: 'head' },
  'mascot:party-hat': { render: OverlayPartyHat, layer: 'head' },
  'mascot:gold-goggles': { render: OverlayGoldGoggles, layer: 'face' },
  'mascot:snorkel': { render: OverlaySnorkel, layer: 'face' },
  'mascot:medal-chain': { render: OverlayMedalChain, layer: 'neck' },
  'mascot:champion-cape': { render: OverlayCape, layer: 'back' },
  'mascot:suit-classic': { render: OverlaySuitClassic, layer: 'body' },
  'mascot:suit-racing': { render: OverlaySuitRacing, layer: 'body' },
  'mascot:suit-tropical': { render: OverlaySuitTropical, layer: 'body' },
  'mascot:shorts-classic': { render: OverlayShortsClassic, layer: 'legs' },
  'mascot:shorts-jammer': { render: OverlayShortsJammer, layer: 'legs' },
  'mascot:shorts-sunset': { render: OverlayShortsSunset, layer: 'legs' },
};

export default function MascotOverlays({
  sex = 'male',
  level = 'intermediate',
  equipped = [],
  blink = false,
  className = '',
}) {
  const style = LEVEL_STYLES[level] || LEVEL_STYLES.intermediate;
  const active = equipped.filter((id) => isMascotItemForSex(id, sex));

  const hasGoggles = active.some((id) => id === 'mascot:gold-goggles');
  const hasMedal = active.some((id) => id === 'mascot:medal-chain');
  const hasHead = active.some((id) => ITEM_OVERLAYS[id]?.layer === 'head');

  const back = active.filter((id) => ITEM_OVERLAYS[id]?.layer === 'back');
  const body = active.filter((id) => ['body', 'legs'].includes(ITEM_OVERLAYS[id]?.layer));
  const front = active.filter((id) => ['head', 'face', 'neck'].includes(ITEM_OVERLAYS[id]?.layer));

  const strapColor = sex === 'female' ? '#E85A8C' : '#3B5BFF';

  return (
    <svg
      viewBox="0 0 100 140"
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {back.map((id) => {
        const Layer = ITEM_OVERLAYS[id]?.render;
        return Layer ? <Layer key={id} /> : null;
      })}

      {body.map((id) => {
        const Layer = ITEM_OVERLAYS[id]?.render;
        return Layer ? <Layer key={id} /> : null;
      })}

      {style.accessory === 'floaties' && <OverlayFloaties />}
      {style.accessory === 'goggles' && !hasGoggles && <OverlayGoggles strapColor={strapColor} />}
      {style.accessory === 'medal' && !hasMedal && <OverlayMedal />}

      {front.map((id) => {
        const Layer = ITEM_OVERLAYS[id]?.render;
        return Layer ? <Layer key={id} /> : null;
      })}

      {blink && !hasHead && (
        <>
          <ellipse cx="38" cy="30" rx="8" ry="1.2" fill="#8B5A2B" />
          <ellipse cx="62" cy="30" rx="8" ry="1.2" fill="#8B5A2B" />
        </>
      )}
    </svg>
  );
}
