/**
 * SVG swim-coach monkey mascot — male/female variants, level upgrades, shop cosmetics.
 */

import { isMascotItemForSex } from '../../lib/mascotConstants';

const LEVEL_STYLES = {
  beginner: {
    cap: '#F59E0B',
    capAccent: '#D97706',
    aura: 'rgba(245, 158, 11, 0.15)',
    accessory: 'floaties',
  },
  intermediate: {
    cap: '#3B82F6',
    capAccent: '#2563EB',
    aura: 'rgba(59, 130, 246, 0.15)',
    accessory: 'goggles',
  },
  advanced: {
    cap: '#10B981',
    capAccent: '#059669',
    aura: 'rgba(16, 185, 129, 0.2)',
    accessory: 'medal',
  },
};

function Floaties() {
  return (
    <>
      <ellipse cx="52" cy="118" rx="14" ry="8" fill="#60A5FA" stroke="#2563EB" strokeWidth="2" />
      <ellipse cx="108" cy="118" rx="14" ry="8" fill="#60A5FA" stroke="#2563EB" strokeWidth="2" />
    </>
  );
}

function Goggles({ capColor }) {
  return (
    <>
      <rect x="62" y="58" width="36" height="14" rx="7" fill={capColor} opacity="0.35" />
      <ellipse cx="72" cy="65" rx="10" ry="8" fill="#1E293B" opacity="0.85" />
      <ellipse cx="88" cy="65" rx="10" ry="8" fill="#1E293B" opacity="0.85" />
      <path d="M82 65h0" stroke="#94A3B8" strokeWidth="2" />
    </>
  );
}

function Medal() {
  return (
    <>
      <circle cx="80" cy="108" r="10" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
      <text x="80" y="112" textAnchor="middle" fontSize="9" fontWeight="800" fill="#92400E">1</text>
      <path d="M74 118 L80 128 L86 118" fill="#EAB308" />
    </>
  );
}

function NeonCap() {
  return (
    <path
      d="M46 52 C46 30, 62 22, 80 22 C98 22, 114 30, 114 52 C114 58, 108 60, 80 60 C52 60, 46 58, 46 52 Z"
      fill="#00E5FF"
      stroke="#7C3AED"
      strokeWidth="2"
    />
  );
}

function PartyHat() {
  return (
    <>
      <path d="M58 48 L80 18 L102 48 Z" fill="#F472B6" stroke="#DB2777" strokeWidth="1.5" />
      <circle cx="80" cy="18" r="4" fill="#FDE047" />
      <ellipse cx="80" cy="48" rx="24" ry="5" fill="#F9A8D4" />
    </>
  );
}

function GoldGoggles() {
  return (
    <>
      <ellipse cx="72" cy="65" rx="11" ry="9" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
      <ellipse cx="88" cy="65" rx="11" ry="9" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
      <ellipse cx="72" cy="65" rx="7" ry="5" fill="#1E293B" opacity="0.7" />
      <ellipse cx="88" cy="65" rx="7" ry="5" fill="#1E293B" opacity="0.7" />
      <path d="M61 65 H99" stroke="#CA8A04" strokeWidth="2" />
    </>
  );
}

function Snorkel() {
  return (
    <>
      <path d="M100 58 C112 58, 118 72, 114 88" fill="none" stroke="#F97316" strokeWidth="4" strokeLinecap="round" />
      <circle cx="114" cy="88" r="4" fill="#FB923C" />
    </>
  );
}

function MedalChain() {
  return (
    <>
      <path d="M68 98 Q80 108 92 98" fill="none" stroke="#CA8A04" strokeWidth="2" />
      <circle cx="80" cy="112" r="9" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
      <text x="80" y="116" textAnchor="middle" fontSize="8" fontWeight="800" fill="#92400E">★</text>
    </>
  );
}

function ChampionCape() {
  return (
    <path
      d="M46 96 C30 100, 28 130, 36 148 C48 132, 56 124, 80 120 C104 124, 112 132, 124 148 C132 130, 130 100, 114 96 C108 108, 96 114, 80 114 C64 114, 52 108, 46 96 Z"
      fill="#7C3AED"
      stroke="#5B21B6"
      strokeWidth="1.5"
      opacity="0.9"
    />
  );
}

function SuitClassic() {
  return (
    <>
      <path
        d="M56 86 C64 80, 96 80, 104 86 L102 130 Q80 136 58 130 Z"
        fill="#3B5BFF"
        stroke="#2563EB"
        strokeWidth="1.5"
      />
      <path d="M62 86 L68 94" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M98 86 L92 94" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="80" cy="100" rx="10" ry="6" fill="#60A5FA" opacity="0.35" />
    </>
  );
}

function SuitRacing() {
  return (
    <>
      <path
        d="M58 88 L56 132 Q80 138 104 132 L102 88 Q80 84 58 88 Z"
        fill="#0F172A"
        stroke="#1E293B"
        strokeWidth="1.5"
      />
      <path d="M80 88 L80 132" stroke="#EF4444" strokeWidth="3" />
      <path d="M64 92 L72 100 M96 92 L88 100" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

function SuitTropical() {
  return (
    <>
      <path
        d="M56 86 C64 80, 96 80, 104 86 L102 130 Q80 136 58 130 Z"
        fill="#0D9488"
        stroke="#0F766E"
        strokeWidth="1.5"
      />
      <circle cx="72" cy="108" r="5" fill="#FB7185" opacity="0.9" />
      <circle cx="90" cy="118" r="4" fill="#FBBF24" opacity="0.9" />
      <path d="M62 86 L68 94 M98 86 L92 94" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" />
    </>
  );
}

function ShortsClassic() {
  return (
    <>
      <path
        d="M54 104 L52 132 Q80 138 108 132 L106 104 Q80 112 54 104 Z"
        fill="#1E3A8A"
        stroke="#1E40AF"
        strokeWidth="1.5"
      />
      <path d="M54 118 H106" stroke="#3B82F6" strokeWidth="1.5" opacity="0.6" />
    </>
  );
}

function ShortsJammer() {
  return (
    <>
      <path
        d="M56 96 L54 134 Q80 140 106 134 L104 96 Q80 100 56 96 Z"
        fill="#0F172A"
        stroke="#3B82F6"
        strokeWidth="2"
      />
      <path d="M80 96 L80 134" stroke="#2563EB" strokeWidth="2" opacity="0.5" />
    </>
  );
}

function ShortsSunset() {
  return (
    <>
      <defs>
        <linearGradient id="shortsSunsetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="50%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>
      </defs>
      <path
        d="M54 104 L52 132 Q80 138 108 132 L106 104 Q80 112 54 104 Z"
        fill="url(#shortsSunsetGrad)"
        stroke="#EA580C"
        strokeWidth="1.5"
      />
    </>
  );
}

const EQUIPPED_LAYERS = {
  'mascot:neon-cap': { render: NeonCap, hideCap: true },
  'mascot:party-hat': { render: PartyHat, hideCap: true },
  'mascot:gold-goggles': { render: GoldGoggles, hideLevelAccessory: 'goggles' },
  'mascot:snorkel': { render: Snorkel },
  'mascot:medal-chain': { render: MedalChain, hideLevelAccessory: 'medal' },
  'mascot:champion-cape': { render: ChampionCape, behindBody: true },
  'mascot:suit-classic': { render: SuitClassic, onBody: true, hideBelly: true },
  'mascot:suit-racing': { render: SuitRacing, onBody: true, hideBelly: true },
  'mascot:suit-tropical': { render: SuitTropical, onBody: true, hideBelly: true },
  'mascot:shorts-classic': { render: ShortsClassic, onBody: true, hideBelly: true },
  'mascot:shorts-jammer': { render: ShortsJammer, onBody: true, hideBelly: true },
  'mascot:shorts-sunset': { render: ShortsSunset, onBody: true, hideBelly: true },
};

export default function MascotSvg({
  sex = 'male',
  level = 'intermediate',
  blink = false,
  equipped = [],
  className = '',
  size = 160,
}) {
  const style = LEVEL_STYLES[level] || LEVEL_STYLES.intermediate;
  const isFemale = sex === 'female';
  const capColor = isFemale ? '#E85A8C' : style.cap;
  const capAccent = isFemale ? '#DB2777' : style.capAccent;
  const uid = `${level}-${sex}-${equipped.join(',')}`;

  const activeEquipped = equipped.filter((id) => isMascotItemForSex(id, sex));

  const hideCap = activeEquipped.some((id) => EQUIPPED_LAYERS[id]?.hideCap);
  const hideGoggles = activeEquipped.some((id) => EQUIPPED_LAYERS[id]?.hideLevelAccessory === 'goggles');
  const hideMedal = activeEquipped.some((id) => EQUIPPED_LAYERS[id]?.hideLevelAccessory === 'medal');
  const hideBelly = activeEquipped.some((id) => EQUIPPED_LAYERS[id]?.hideBelly);

  const backLayers = activeEquipped.filter((id) => EQUIPPED_LAYERS[id]?.behindBody);
  const bodyLayers = activeEquipped.filter((id) => EQUIPPED_LAYERS[id]?.onBody);
  const frontLayers = activeEquipped.filter(
    (id) => !EQUIPPED_LAYERS[id]?.behindBody && !EQUIPPED_LAYERS[id]?.onBody
  );

  return (
    <svg
      viewBox="0 0 160 160"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`mascotAura-${uid}`} cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor={style.aura} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      <circle cx="80" cy="88" r="72" fill={`url(#mascotAura-${uid})`} />

      {/* Tail */}
      <path
        d="M118 98 C138 88, 142 72, 132 58 C128 68, 122 78, 112 86 Z"
        fill="#8B5E3C"
        stroke="#6B4423"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {backLayers.map((id) => {
        const Layer = EQUIPPED_LAYERS[id]?.render;
        return Layer ? <Layer key={id} /> : null;
      })}

      {/* Body */}
      <ellipse cx="80" cy="108" rx="34" ry="30" fill="#A0714F" />
      {!hideBelly && <ellipse cx="80" cy="104" rx="24" ry="20" fill="#F5DEB3" />}

      {bodyLayers.map((id) => {
        const Layer = EQUIPPED_LAYERS[id]?.render;
        return Layer ? <Layer key={id} /> : null;
      })}

      {/* Arms */}
      <ellipse cx="48" cy="102" rx="10" ry="16" fill="#8B5E3C" transform="rotate(-18 48 102)" />
      <ellipse cx="112" cy="98" rx="10" ry="16" fill="#8B5E3C" transform="rotate(24 112 98)" />
      <circle cx="42" cy="112" r="7" fill="#F5DEB3" />
      <circle cx="118" cy="108" r="7" fill="#F5DEB3" />

      {/* Head */}
      <circle cx="80" cy="62" r="36" fill="#8B5E3C" />
      <ellipse cx="80" cy="68" rx="28" ry="26" fill="#F5DEB3" />

      {/* Ears */}
      <circle cx="52" cy="44" r="12" fill="#8B5E3C" />
      <circle cx="108" cy="44" r="12" fill="#8B5E3C" />
      <circle cx="52" cy="44" r="7" fill="#F0C9A6" />
      <circle cx="108" cy="44" r="7" fill="#F0C9A6" />

      {/* Hair tuft / ponytail */}
      {isFemale ? (
        <>
          <circle cx="80" cy="30" r="6" fill="#6B4423" />
          <path d="M88 28 C98 24, 104 36, 100 48 C96 40, 92 34, 88 30" fill="#6B4423" />
          <circle cx="98" cy="34" r="4" fill="#E85A8C" opacity="0.9" />
        </>
      ) : (
        <path d="M68 30 L72 22 L76 30 M84 28 L88 20 L92 28 M76 32 L80 24 L84 32" stroke="#6B4423" strokeWidth="2.5" strokeLinecap="round" />
      )}

      {/* Swim cap (hidden when shop head item equipped) */}
      {!hideCap && (
        <>
          <path
            d="M46 52 C46 30, 62 22, 80 22 C98 22, 114 30, 114 52 C114 58, 108 60, 80 60 C52 60, 46 58, 46 52 Z"
            fill={capColor}
          />
          <path
            d="M46 52 C58 56, 68 58, 80 58 C92 58, 102 56, 114 52"
            stroke={capAccent}
            strokeWidth="2"
            fill="none"
            opacity="0.5"
          />
        </>
      )}

      {/* Eyes */}
      <ellipse cx="68" cy="66" rx="7" ry={blink ? 1.5 : 8} fill="#1E293B" />
      <ellipse cx="92" cy="66" rx="7" ry={blink ? 1.5 : 8} fill="#1E293B" />
      {!blink && (
        <>
          <circle cx="70" cy="63" r="2.5" fill="#fff" />
          <circle cx="94" cy="63" r="2.5" fill="#fff" />
          {isFemale && (
            <>
              <path d="M60 58 L64 56" stroke="#6B4423" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M96 56 L100 58" stroke="#6B4423" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
        </>
      )}

      {/* Nose & mouth */}
      <ellipse cx="80" cy="76" rx="5" ry="4" fill="#D4A574" />
      <path d="M72 84 Q80 90 88 84" stroke="#6B4423" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Level accessories */}
      {style.accessory === 'floaties' && <Floaties />}
      {style.accessory === 'goggles' && !hideGoggles && <Goggles capColor={capColor} />}
      {style.accessory === 'medal' && !hideMedal && <Medal />}

      {frontLayers.map((id) => {
        const Layer = EQUIPPED_LAYERS[id]?.render;
        return Layer ? <Layer key={id} /> : null;
      })}
    </svg>
  );
}
