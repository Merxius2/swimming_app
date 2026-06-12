/**
 * Custom SVG badge for each swim medal.
 */

const TIER = {
  bronze: { from: '#92400E', to: '#F59E0B', rim: '#78350F', ribbon: '#B45309' },
  silver: { from: '#6B7280', to: '#E5E7EB', rim: '#4B5563', ribbon: '#9CA3AF' },
  gold: { from: '#CA8A04', to: '#FDE047', rim: '#A16207', ribbon: '#EAB308' },
};

const Glyph = ({ id }) => {
  switch (id) {
    case 'first_splash':
      return (
        <>
          <path d="M32 14c-6 8-12 14-12 22a12 12 0 1024 0c0-8-6-14-12-22z" fill="#3B82F6" opacity="0.9" />
          <ellipse cx="32" cy="38" rx="8" ry="3" fill="#2563EB" opacity="0.35" />
        </>
      );
    case 'ten_sessions':
      return <text x="32" y="38" textAnchor="middle" fontSize="18" fontWeight="800" fill="#fff">10</text>;
    case 'twenty_five_sessions':
      return <text x="32" y="38" textAnchor="middle" fontSize="16" fontWeight="800" fill="#fff">25</text>;
    case 'fifty_sessions':
      return <text x="32" y="38" textAnchor="middle" fontSize="16" fontWeight="800" fill="#fff">50</text>;
    case 'ten_k_lifetime':
      return <text x="32" y="38" textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff">10K</text>;
    case 'fifty_k_lifetime':
      return <text x="32" y="38" textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff">50K</text>;
    case 'hundred_k_lifetime':
      return <text x="32" y="37" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">100K</text>;
    case 'two_hundred_k':
      return <text x="32" y="37" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">200K</text>;
    case 'lap_legend':
      return (
        <>
          <circle cx="32" cy="32" r="10" fill="none" stroke="#fff" strokeWidth="2.5" />
          <path d="M32 22v20M22 32h20" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case 'calorie_collector':
      return (
        <>
          <path d="M32 18c-2 4-8 6-8 12a8 8 0 1016 0c0-6-6-8-8-12z" fill="#EF4444" />
          <path d="M32 26v10M28 30h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case 'two_k_session':
      return <text x="32" y="38" textAnchor="middle" fontSize="15" fontWeight="800" fill="#fff">2K</text>;
    case 'two_five_k_session':
      return <text x="32" y="38" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff">2.5K</text>;
    case 'three_k_session':
      return <text x="32" y="38" textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff">3K</text>;
    case 'sub_200_pace':
      return (
        <>
          <circle cx="32" cy="32" r="11" fill="none" stroke="#fff" strokeWidth="2" />
          <path d="M32 32V24M32 32l5 5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          <text x="32" y="44" textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff">2:00</text>
        </>
      );
    case 'sub_210_pace':
      return (
        <>
          <circle cx="32" cy="32" r="11" fill="none" stroke="#fff" strokeWidth="2" />
          <path d="M32 32V24M32 32l5 5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          <text x="32" y="44" textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff">2:10</text>
        </>
      );
    case 'marathon_session':
      return (
        <>
          <rect x="22" y="24" width="20" height="16" rx="3" fill="none" stroke="#fff" strokeWidth="2" />
          <path d="M26 32h12M26 36h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case 'century_laps':
      return <text x="32" y="38" textAnchor="middle" fontSize="16" fontWeight="800" fill="#fff">100</text>;
    case 'furnace':
      return (
        <>
          <path d="M32 42c-6-4-10-10-10-16c0-4 4-8 10-8s10 4 10 8c0 6-4 12-10 16z" fill="#F97316" />
          <path d="M32 28c-2 3-4 5-4 8a4 4 0 008 0c0-3-2-5-4-8z" fill="#FBBF24" />
        </>
      );
    case 'pulse_racer':
      return (
        <path
          d="M20 34h6l3-8 4 16 3-8h6"
          fill="none"
          stroke="#EF4444"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case 'goal_crusher':
      return (
        <>
          <circle cx="32" cy="32" r="10" fill="none" stroke="#fff" strokeWidth="2" />
          <path d="M26 32l4 4 8-8" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case 'frog_master':
      return (
        <>
          <ellipse cx="28" cy="30" rx="4" ry="5" fill="#22C55E" />
          <ellipse cx="36" cy="30" rx="4" ry="5" fill="#22C55E" />
          <ellipse cx="32" cy="36" rx="8" ry="6" fill="#16A34A" />
        </>
      );
    case 'four_sessions_week':
      return (
        <>
          <rect x="20" y="22" width="24" height="18" rx="2" fill="none" stroke="#fff" strokeWidth="2" />
          <path d="M20 28h24M28 22v18M36 22v18M44 22v18" stroke="#fff" strokeWidth="1.5" />
          <text x="32" y="38" textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff">4×</text>
        </>
      );
    case 'five_k_week':
      return (
        <>
          <rect x="20" y="22" width="24" height="18" rx="2" fill="none" stroke="#fff" strokeWidth="2" />
          <text x="32" y="36" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">5K</text>
        </>
      );
    case 'hat_trick':
      return (
        <>
          <circle cx="24" cy="34" r="4" fill="#fff" />
          <circle cx="32" cy="34" r="4" fill="#fff" />
          <circle cx="40" cy="34" r="4" fill="#fff" />
          <path d="M20 34h24" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case 'week_warrior':
      return (
        <>
          <path d="M32 20l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" fill="#F97316" />
          <text x="32" y="44" textAnchor="middle" fontSize="8" fontWeight="800" fill="#fff">7d</text>
        </>
      );
    case 'fortnight_flow':
      return (
        <>
          <path d="M32 18l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" fill="#F97316" />
          <text x="32" y="44" textAnchor="middle" fontSize="8" fontWeight="800" fill="#fff">14d</text>
        </>
      );
    case 'eight_sessions_month':
      return (
        <>
          <rect x="22" y="22" width="20" height="16" rx="2" fill="none" stroke="#fff" strokeWidth="2" />
          <text x="32" y="36" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">8</text>
        </>
      );
    case 'ten_k_month':
      return (
        <>
          <rect x="22" y="22" width="20" height="16" rx="2" fill="none" stroke="#fff" strokeWidth="2" />
          <text x="32" y="36" textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff">10K</text>
        </>
      );
    case 'twenty_k_month':
      return (
        <>
          <rect x="22" y="22" width="20" height="16" rx="2" fill="none" stroke="#fff" strokeWidth="2" />
          <text x="32" y="36" textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff">20K</text>
        </>
      );
    case 'ten_k_cal_month':
      return (
        <>
          <rect x="22" y="22" width="20" height="16" rx="2" fill="none" stroke="#fff" strokeWidth="2" />
          <path d="M32 26c-2 3-5 4-5 7a5 5 0 1010 0c0-3-3-4-5-7z" fill="#EF4444" transform="scale(0.7) translate(14 8)" />
        </>
      );
    case 'season_summer':
      return (
        <>
          <circle cx="32" cy="30" r="9" fill="#FBBF24" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1={32 + Math.cos((deg * Math.PI) / 180) * 12}
              y1={30 + Math.sin((deg * Math.PI) / 180) * 12}
              x2={32 + Math.cos((deg * Math.PI) / 180) * 16}
              y2={30 + Math.sin((deg * Math.PI) / 180) * 16}
              stroke="#F59E0B"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}
        </>
      );
    case 'season_winter':
      return (
        <>
          <path d="M32 18v28M22 28h20M25 22l14 12M39 22L25 34" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="32" cy="32" r="3" fill="#BFDBFE" />
        </>
      );
    case 'season_spring':
      return (
        <>
          <circle cx="32" cy="28" r="5" fill="#F472B6" />
          <circle cx="26" cy="34" r="4" fill="#FB7185" />
          <circle cx="38" cy="34" r="4" fill="#FB7185" />
          <path d="M32 36v8" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case 'season_autumn':
      return (
        <>
          <path d="M32 20c-4 6-8 10-8 16 0 4 3.5 8 8 8s8-4 8-8c0-6-4-10-8-16z" fill="#F97316" />
          <path d="M32 20c2 4 4 6 4 10" fill="none" stroke="#EA580C" strokeWidth="1.5" />
        </>
      );
    case 'early_bird':
      return (
        <>
          <circle cx="32" cy="28" r="8" fill="#FBBF24" />
          <path d="M24 38c2-4 6-6 8-6s6 2 8 6" fill="#F59E0B" />
          <path d="M28 26l2 2 4-4" fill="none" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case 'night_owl':
      return (
        <>
          <path d="M28 22a10 10 0 1012 12 8 8 0 01-12-12z" fill="#6366F1" />
          <circle cx="42" cy="24" r="1.5" fill="#fff" />
          <circle cx="46" cy="30" r="1" fill="#fff" />
        </>
      );
    case 'comeback':
      return (
        <>
          <path d="M22 36c4-8 10-12 18-12 6 0 10 4 10 10" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M42 30l4 4-4 4" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case 'double_dip':
      return (
        <>
          <ellipse cx="26" cy="34" rx="6" ry="4" fill="#3B82F6" opacity="0.8" />
          <ellipse cx="38" cy="30" rx="6" ry="4" fill="#3B82F6" />
        </>
      );
    case 'holiday_splash':
      return (
        <>
          <path d="M32 18l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z" fill="#EF4444" />
          <path d="M24 40h16" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" />
        </>
      );
    case 'january_jolt':
      return (
        <>
          <text x="32" y="30" textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff">JAN</text>
          <path d="M26 36h12M32 36v6" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />
        </>
      );
    default:
      return (
        <path d="M32 20l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z" fill="#fff" opacity="0.9" />
      );
  }
};

export default function MedalIcon({ id, tier = 'bronze', size = 48, className = '', animate = false, locked = false }) {
  const colors = TIER[tier] || TIER.bronze;
  const uid = `medal-${id}-${tier}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={`${className} ${animate ? 'medal-icon-pop' : ''}`.trim()}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${uid}-face`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.from} />
          <stop offset="100%" stopColor={colors.to} />
        </linearGradient>
        <linearGradient id={`${uid}-ribbon`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.ribbon} />
          <stop offset="100%" stopColor={colors.rim} />
        </linearGradient>
      </defs>

      {/* Ribbon tails */}
      <path d="M24 52 L20 62 L28 56 Z" fill={`url(#${uid}-ribbon)`} />
      <path d="M40 52 L44 62 L36 56 Z" fill={`url(#${uid}-ribbon)`} />

      {/* Scalloped medal rim */}
      <circle cx="32" cy="32" r="22" fill={`url(#${uid}-face)`} stroke={colors.rim} strokeWidth="1.5" />
      <circle cx="32" cy="32" r="18" fill="rgba(255,255,255,0.12)" />

      {/* Inner face */}
      <circle
        cx="32"
        cy="32"
        r="15"
        fill={locked ? '#9CA3AF' : 'rgba(255,255,255,0.95)'}
        opacity={locked ? 0.5 : 1}
      />

      {!locked && (
        <g transform="translate(0,0)">
          <Glyph id={id} />
        </g>
      )}

      {locked && (
        <g transform="translate(32,32)">
          <rect x="-6" y="-2" width="12" height="10" rx="2" fill="#6B7280" />
          <path d="M-4 -2 V-5 a4 4 0 018 0 V-2" fill="none" stroke="#6B7280" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}
