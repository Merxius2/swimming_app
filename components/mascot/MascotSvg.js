/**
 * SVG swim-coach monkey — Flip & Flo character sheet style.
 * Palette: fur #8B5A2B, tan #FFE8C6, brand #3B5BFF, shorts #1C2E5A
 */

import { isMascotItemForSex } from '../../lib/mascotConstants';

const FUR = '#8B5A2B';
const FUR_DARK = '#6B4423';
const TAN = '#FFE8C6';
const SHORTS_NAVY = '#1C2E5A';
const BRAND_BLUE = '#3B5BFF';
const BRAND_PINK = '#E85A8C';

const BRAND = {
  male: { cap: BRAND_BLUE, capAccent: '#2A45CC', shirt: BRAND_BLUE, lanyard: BRAND_BLUE },
  female: { cap: BRAND_PINK, capAccent: '#DB2777', shirt: BRAND_PINK, lanyard: BRAND_PINK },
};

const LEVEL_STYLES = {
  beginner: { aura: 'rgba(245, 166, 35, 0.14)', accessory: 'floaties' },
  intermediate: { aura: 'rgba(59, 91, 255, 0.14)', accessory: 'goggles' },
  advanced: { aura: 'rgba(61, 203, 165, 0.18)', accessory: 'medal' },
};

function SwimmerLogo({ x, y, scale = 1, color = '#fff' }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <circle cx="4" cy="2.5" r="2" fill={color} />
      <path d="M4 5 C7 6, 8 9, 6 11" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M4 5 L2 8 M4 5 L6 8" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </g>
  );
}

function Floaties() {
  return (
    <>
      <ellipse cx="38" cy="116" rx="12" ry="7" fill="#60A5FA" stroke="#2563EB" strokeWidth="1.5" />
      <ellipse cx="122" cy="114" rx="12" ry="7" fill="#60A5FA" stroke="#2563EB" strokeWidth="1.5" />
    </>
  );
}

function Goggles({ strapColor }) {
  return (
    <>
      <path d="M58 62 Q80 56 102 62" stroke={strapColor} strokeWidth="2.5" fill="none" opacity="0.5" />
      <ellipse cx="68" cy="66" rx="9" ry="7" fill="#1E293B" opacity="0.9" />
      <ellipse cx="92" cy="66" rx="9" ry="7" fill="#1E293B" opacity="0.9" />
      <ellipse cx="68" cy="66" rx="9" ry="7" fill="none" stroke="#94A3B8" strokeWidth="1.5" />
      <ellipse cx="92" cy="66" rx="9" ry="7" fill="none" stroke="#94A3B8" strokeWidth="1.5" />
    </>
  );
}

function LevelMedal() {
  return (
    <>
      <circle cx="80" cy="118" r="9" fill="#F5A623" stroke="#CA8A04" strokeWidth="1.5" />
      <text x="80" y="122" textAnchor="middle" fontSize="8" fontWeight="800" fill="#92400E">1</text>
    </>
  );
}

function CoachShirt({ color }) {
  return (
    <>
      <path
        d="M50 86 C50 78, 58 74, 80 74 C102 74, 110 78, 110 86 L108 114 Q80 120 52 114 Z"
        fill={color}
      />
      <path d="M50 86 L44 98 M110 86 L116 98" stroke={color} strokeWidth="6" strokeLinecap="round" />
      <text
        x="80"
        y="102"
        textAnchor="middle"
        fontSize="10"
        fontWeight="800"
        fill="#fff"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.5"
      >
        COACH
      </text>
    </>
  );
}

function CoachShorts() {
  return (
    <>
      <path
        d="M54 112 L52 136 Q80 142 108 136 L106 112 Q80 118 54 112 Z"
        fill={SHORTS_NAVY}
        stroke="#152347"
        strokeWidth="1"
      />
      <path d="M62 118 Q80 122 98 118" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.55" />
      <SwimmerLogo x={90} y={124} scale={0.85} />
    </>
  );
}

function Whistle({ lanyardColor }) {
  return (
    <>
      <path d="M80 74 L80 92" stroke={lanyardColor} strokeWidth="2" fill="none" />
      <rect x="76" y="92" width="8" height="10" rx="3" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1" />
      <circle cx="80" cy="95" r="1.5" fill="#6B7280" />
    </>
  );
}

function DefaultCap({ color, accent, isFemale }) {
  return (
    <>
      <path
        d="M44 54 C44 28, 60 18, 80 18 C100 18, 116 28, 116 54 C116 60, 108 62, 80 62 C52 62, 44 60, 44 54 Z"
        fill={color}
      />
      <path
        d="M44 54 C56 58, 68 60, 80 60 C92 60, 104 58, 116 54"
        stroke={accent}
        strokeWidth="1.5"
        fill="none"
        opacity="0.45"
      />
      <SwimmerLogo x={73} y={30} scale={1.1} />
      {isFemale && (
        <>
          <circle cx="104" cy="36" r="5" fill={BRAND_PINK} stroke="#DB2777" strokeWidth="1" />
          <circle cx="104" cy="36" r="2" fill="#FBCFE8" />
          <path
            d="M100 22 C108 18, 114 28, 110 42 C106 36, 102 28, 100 22"
            fill={FUR_DARK}
          />
        </>
      )}
    </>
  );
}

function NeonCap() {
  return (
    <path
      d="M44 54 C44 28, 60 18, 80 18 C100 18, 116 28, 116 54 C116 60, 108 62, 80 62 C52 62, 44 60, 44 54 Z"
      fill="#00E5FF"
      stroke="#7C3AED"
      strokeWidth="2"
    />
  );
}

function PartyHat() {
  return (
    <>
      <path d="M56 50 L80 16 L104 50 Z" fill="#F472B6" stroke="#DB2777" strokeWidth="1.5" />
      <circle cx="80" cy="16" r="4" fill="#FDE047" />
      <ellipse cx="80" cy="50" rx="26" ry="5" fill="#F9A8D4" />
    </>
  );
}

function GoldGoggles() {
  return (
    <>
      <ellipse cx="68" cy="66" rx="10" ry="8" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
      <ellipse cx="92" cy="66" rx="10" ry="8" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
      <ellipse cx="68" cy="66" rx="6" ry="4.5" fill="#1E293B" opacity="0.65" />
      <ellipse cx="92" cy="66" rx="6" ry="4.5" fill="#1E293B" opacity="0.65" />
      <path d="M58 66 H102" stroke="#CA8A04" strokeWidth="2" />
    </>
  );
}

function Snorkel() {
  return (
    <>
      <path d="M102 54 C114 54, 120 68, 116 86" fill="none" stroke="#F97316" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="116" cy="86" r="3.5" fill="#FB923C" />
    </>
  );
}

function MedalChain() {
  return (
    <>
      <path d="M68 96 Q80 106 92 96" fill="none" stroke="#CA8A04" strokeWidth="2" />
      <circle cx="80" cy="110" r="8" fill="#F5A623" stroke="#CA8A04" strokeWidth="1.5" />
      <text x="80" y="114" textAnchor="middle" fontSize="7" fontWeight="800" fill="#92400E">★</text>
    </>
  );
}

function ChampionCape() {
  return (
    <path
      d="M44 94 C28 98, 26 128, 34 146 C48 130, 56 122, 80 118 C104 122, 112 130, 126 146 C134 128, 132 98, 116 94 C110 106, 98 112, 80 112 C62 112, 50 106, 44 94 Z"
      fill="#7C3AED"
      stroke="#5B21B6"
      strokeWidth="1.5"
      opacity="0.92"
    />
  );
}

function SuitClassic() {
  return (
    <>
      <path d="M54 74 L52 136 Q80 142 108 136 L106 74 Q80 70 54 74 Z" fill={BRAND_BLUE} stroke="#2A45CC" strokeWidth="1.5" />
      <path d="M60 74 L66 86 M100 74 L94 86" stroke="#2A45CC" strokeWidth="2.5" strokeLinecap="round" />
    </>
  );
}

function SuitRacing() {
  return (
    <>
      <path d="M56 76 L54 136 Q80 142 106 136 L104 76 Q80 72 56 76 Z" fill="#0F172A" stroke="#1E293B" strokeWidth="1.5" />
      <path d="M80 76 L80 136" stroke="#EF4444" strokeWidth="2.5" />
    </>
  );
}

function SuitTropical() {
  return (
    <>
      <path d="M54 74 L52 136 Q80 142 108 136 L106 74 Q80 70 54 74 Z" fill="#0D9488" stroke="#0F766E" strokeWidth="1.5" />
      <circle cx="70" cy="108" r="4" fill="#FB7185" />
      <circle cx="92" cy="120" r="3.5" fill="#FBBF24" />
      <path d="M60 74 L66 86 M100 74 L94 86" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

function ShortsClassic() {
  return (
    <>
      <path d="M54 112 L52 136 Q80 142 108 136 L106 112 Q80 118 54 112 Z" fill="#1E3A8A" stroke="#1E40AF" strokeWidth="1.5" />
      <path d="M62 118 Q80 122 98 118" stroke="#fff" strokeWidth="1.2" fill="none" opacity="0.5" />
    </>
  );
}

function ShortsJammer() {
  return (
    <>
      <path d="M56 108 L54 138 Q80 144 106 138 L104 108 Q80 112 56 108 Z" fill="#0F172A" stroke="#3B82F6" strokeWidth="2" />
      <path d="M80 108 L80 138" stroke="#2563EB" strokeWidth="1.5" opacity="0.45" />
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
        d="M54 112 L52 136 Q80 142 108 136 L106 112 Q80 118 54 112 Z"
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
  'mascot:medal-chain': { render: MedalChain, hideWhistle: true, hideLevelAccessory: 'medal' },
  'mascot:champion-cape': { render: ChampionCape, behindBody: true },
  'mascot:suit-classic': { render: SuitClassic, onBody: true, hideCoachAttire: true },
  'mascot:suit-racing': { render: SuitRacing, onBody: true, hideCoachAttire: true },
  'mascot:suit-tropical': { render: SuitTropical, onBody: true, hideCoachAttire: true },
  'mascot:shorts-classic': { render: ShortsClassic, onBody: true, hideCoachShorts: true },
  'mascot:shorts-jammer': { render: ShortsJammer, onBody: true, hideCoachShorts: true },
  'mascot:shorts-sunset': { render: ShortsSunset, onBody: true, hideCoachShorts: true },
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
  const brand = BRAND[isFemale ? 'female' : 'male'];
  const uid = `${level}-${sex}-${equipped.join(',')}`;

  const activeEquipped = equipped.filter((id) => isMascotItemForSex(id, sex));

  const hideCap = activeEquipped.some((id) => EQUIPPED_LAYERS[id]?.hideCap);
  const hideGoggles = activeEquipped.some((id) => EQUIPPED_LAYERS[id]?.hideLevelAccessory === 'goggles');
  const hideMedal = activeEquipped.some((id) => EQUIPPED_LAYERS[id]?.hideLevelAccessory === 'medal');
  const hideWhistle = activeEquipped.some((id) => EQUIPPED_LAYERS[id]?.hideWhistle);
  const hideCoachAttire = activeEquipped.some((id) => EQUIPPED_LAYERS[id]?.hideCoachAttire);
  const hideCoachShorts = hideCoachAttire || activeEquipped.some((id) => EQUIPPED_LAYERS[id]?.hideCoachShorts);

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
        <radialGradient id={`mascotAura-${uid}`} cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor={style.aura} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      <circle cx="80" cy="90" r="74" fill={`url(#mascotAura-${uid})`} />

      {/* Tail */}
      <path
        d="M120 100 C138 90, 142 72, 132 56 C126 68, 118 80, 108 88 Z"
        fill={FUR}
        stroke={FUR_DARK}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {backLayers.map((id) => {
        const Layer = EQUIPPED_LAYERS[id]?.render;
        return Layer ? <Layer key={id} /> : null;
      })}

      {/* Legs / feet */}
      <ellipse cx="66" cy="138" rx="9" ry="6" fill={TAN} />
      <ellipse cx="94" cy="138" rx="9" ry="6" fill={TAN} />

      {/* Torso fur */}
      <ellipse cx="80" cy="108" rx="32" ry="28" fill={FUR} />

      {/* Default coach shirt */}
      {!hideCoachAttire && <CoachShirt color={brand.shirt} />}

      {/* Default coach shorts */}
      {!hideCoachShorts && <CoachShorts />}

      {/* Shop outfit replacements */}
      {bodyLayers.map((id) => {
        const Layer = EQUIPPED_LAYERS[id]?.render;
        return Layer ? <Layer key={id} /> : null;
      })}

      {/* Arms */}
      <ellipse cx="46" cy="100" rx="9" ry="14" fill={FUR} transform="rotate(-20 46 100)" />
      <ellipse cx="114" cy="98" rx="9" ry="14" fill={FUR} transform="rotate(22 114 98)" />
      <circle cx="40" cy="110" r="6.5" fill={TAN} />
      <circle cx="120" cy="106" r="6.5" fill={TAN} />

      {/* Head fur */}
      <circle cx="80" cy="60" r="34" fill={FUR} />
      <ellipse cx="80" cy="66" rx="26" ry="24" fill={TAN} />

      {/* Ears */}
      <circle cx="50" cy="42" r="11" fill={FUR} />
      <circle cx="110" cy="42" r="11" fill={FUR} />
      <circle cx="50" cy="42" r="6" fill="#F0D4B0" />
      <circle cx="110" cy="42" r="6" fill="#F0D4B0" />

      {/* Male hair tuft */}
      {!isFemale && (
        <path
          d="M66 28 L70 20 L74 28 M82 26 L86 18 L90 26"
          stroke={FUR_DARK}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      )}

      {/* Swim cap */}
      {!hideCap && (
        <DefaultCap color={brand.cap} accent={brand.capAccent} isFemale={isFemale} />
      )}

      {/* Eyes */}
      <ellipse cx="68" cy="64" rx="6.5" ry={blink ? 1.2 : 7.5} fill="#1E293B" />
      <ellipse cx="92" cy="64" rx="6.5" ry={blink ? 1.2 : 7.5} fill="#1E293B" />
      {!blink && (
        <>
          <circle cx="70" cy="61" r="2.2" fill="#fff" />
          <circle cx="94" cy="61" r="2.2" fill="#fff" />
          {isFemale && (
            <>
              <path d="M60 56 L64 54" stroke={FUR_DARK} strokeWidth="1.3" strokeLinecap="round" />
              <path d="M96 54 L100 56" stroke={FUR_DARK} strokeWidth="1.3" strokeLinecap="round" />
            </>
          )}
        </>
      )}

      {/* Nose & smile */}
      <ellipse cx="80" cy="74" rx="4.5" ry="3.5" fill="#E8C49A" />
      <path d="M73 82 Q80 87 87 82" stroke={FUR_DARK} strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Whistle */}
      {!hideWhistle && !hideCoachAttire && <Whistle lanyardColor={brand.lanyard} />}

      {/* Level accessories */}
      {style.accessory === 'floaties' && <Floaties />}
      {style.accessory === 'goggles' && !hideGoggles && <Goggles strapColor={brand.cap} />}
      {style.accessory === 'medal' && !hideMedal && <LevelMedal />}

      {frontLayers.map((id) => {
        const Layer = EQUIPPED_LAYERS[id]?.render;
        return Layer ? <Layer key={id} /> : null;
      })}
    </svg>
  );
}
