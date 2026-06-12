const TIER_GRADIENT = {
  bronze: 'from-amber-700 to-amber-500',
  silver: 'from-gray-400 to-gray-300',
  gold: 'from-yellow-500 to-amber-400',
};

const TIER_RING = {
  bronze: 'ring-amber-600/40',
  silver: 'ring-gray-400/40',
  gold: 'ring-yellow-500/50',
};

/**
 * Single monthly medal — one per month, tier upgrades bronze → silver → gold.
 */
export default function MonthlyMedalIcon({
  tier = null,
  size = 48,
  className = '',
  showEmoji = true,
  muted = false,
}) {
  const px = `${size}px`;
  const fontSize = Math.round(size * 0.45);

  if (!tier || muted) {
    return (
      <div
        className={`rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-100/80 dark:bg-gray-800/50 text-gray-400 ${className}`}
        style={{ width: px, height: px, fontSize }}
        aria-hidden={!tier}
      >
        {tier && showEmoji ? '🏅' : '·'}
      </div>
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white shadow-inner ring-2 bg-gradient-to-br ${TIER_GRADIENT[tier]} ${TIER_RING[tier]} ${className}`}
      style={{ width: px, height: px, fontSize }}
    >
      {showEmoji ? '🏅' : null}
    </div>
  );
}

export { TIER_GRADIENT, TIER_RING };
