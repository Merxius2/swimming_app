/** Wheel of fortune — bet amounts, segments, and spin resolution. */

export const WHEEL_BETS = [1, 10, 100];

/** Minimum share of the wheel for all "nothing" slices combined. */
export const MIN_NOTHING_SHARE = 0.5;

/** Extra nothing share at low bets (fades to 0 by bet 100). */
export const NOTHING_LOW_BET_BONUS = 0.05;

/** Default weight for win slices (coins / free spin). */
export const DEFAULT_WIN_WEIGHT = 10;

/** Shared grey for all "nothing" wedges (no labels). */
export const NOTHING_COLOR = '#71717A';

/**
 * Alternating nothing ↔ wins. Win weights control landing odds
 * (5× is intentionally tiny).
 */
export const WHEEL_SEGMENT_DEFS = [
  { id: 'nothing-1', type: 'nothing', color: NOTHING_COLOR },
  { id: 'coins-2', type: 'coins', multiplier: 2, color: '#F59E0B', weight: 14 },
  { id: 'nothing-2', type: 'nothing', color: NOTHING_COLOR },
  { id: 'coins-3', type: 'coins', multiplier: 3, color: '#FBBF24', weight: 12 },
  { id: 'nothing-3', type: 'nothing', color: NOTHING_COLOR },
  { id: 'free', type: 'free_spin', multiplier: 1, color: '#7B5BFF', weight: 10 },
  { id: 'nothing-4', type: 'nothing', color: NOTHING_COLOR },
  { id: 'free-2', type: 'free_spin', multiplier: 2, color: '#6366F1', weight: 6 },
  { id: 'nothing-5', type: 'nothing', color: NOTHING_COLOR },
  { id: 'coins-5', type: 'coins', multiplier: 5, color: '#FFD700', shiny: true, weight: 2 },
];

const NOTHING_COUNT = WHEEL_SEGMENT_DEFS.filter((s) => s.type === 'nothing').length;

export function segmentWinWeight(def) {
  return def.weight ?? DEFAULT_WIN_WEIGHT;
}

/** Combined share for all nothing slices — at least 50%, slightly larger on small bets. */
export function nothingCombinedShare(bet) {
  const lowBetBonus = NOTHING_LOW_BET_BONUS * Math.max(0, 2 - Math.log10(bet));
  return MIN_NOTHING_SHARE + lowBetBonus;
}

/** Build wheel layout — nothing ≥50%, wins weighted (5× is rare). */
export function buildWheelLayout(bet) {
  const nothingShare = nothingCombinedShare(bet);
  const winShare = 1 - nothingShare;
  const nothingEach = nothingShare / NOTHING_COUNT;

  const winWeightTotal = WHEEL_SEGMENT_DEFS
    .filter((def) => def.type !== 'nothing')
    .reduce((sum, def) => sum + segmentWinWeight(def), 0);

  const weights = WHEEL_SEGMENT_DEFS.map((def) => {
    if (def.type === 'nothing') return nothingEach;
    return winShare * (segmentWinWeight(def) / winWeightTotal);
  });
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = 0;

  const segments = WHEEL_SEGMENT_DEFS.map((def, index) => {
    const weight = weights[index];
    const sweepDeg = (weight / totalWeight) * 360;
    const segment = {
      ...def,
      index,
      weight,
      startDeg: cursor,
      sweepDeg,
    };
    cursor += sweepDeg;
    return segment;
  });

  return { segments, totalWeight };
}

export function combinedNothingSweepDeg(layout) {
  return layout.segments
    .filter((segment) => segment.type === 'nothing')
    .reduce((sum, segment) => sum + segment.sweepDeg, 0);
}

/** Weighted random pick — slice size matches landing odds. */
export function pickRandomSegmentIndex(layout) {
  const roll = Math.random() * layout.totalWeight;
  let accumulated = 0;

  for (const segment of layout.segments) {
    accumulated += segment.weight;
    if (roll < accumulated) return segment.index;
  }

  return layout.segments.length - 1;
}

/**
 * Compute final rotation (deg) so segment `index` lands under the top pointer.
 * Adds full spins for animation flair.
 */
export function getSpinRotation(segmentIndex, layout, currentRotation = 0, extraSpins = 5) {
  const segment = layout.segments[segmentIndex];
  if (!segment) return currentRotation;

  const segmentCenter = segment.startDeg + segment.sweepDeg / 2;
  const targetMod = (360 - segmentCenter) % 360;
  const currentMod = ((currentRotation % 360) + 360) % 360;
  let delta = targetMod - currentMod;
  if (delta <= 0) delta += 360;
  return currentRotation + extraSpins * 360 + delta;
}

/** Apply outcome after bet handling at spin start. */
export function resolveWheelOutcome(segment, bet, { usedFreeSpin = false } = {}) {
  if (!segment) {
    return { type: 'unknown', coinsDelta: 0 };
  }

  if (segment.type === 'coins') {
    return {
      type: 'coins',
      multiplier: segment.multiplier,
      coinsDelta: bet * segment.multiplier,
    };
  }

  if (segment.type === 'free_spin') {
    const count = segment.multiplier ?? 1;
    return {
      type: 'free_spin',
      coinsDelta: usedFreeSpin ? 0 : bet * count,
      freeSpinsGranted: count,
    };
  }

  if (segment.type === 'nothing') {
    return {
      type: 'nothing',
      coinsDelta: 0,
      amountLost: bet,
    };
  }

  return { type: 'unknown', coinsDelta: 0 };
}

export function canAffordSpin(totalCoins, bet, freeSpins = 0) {
  return freeSpins > 0 || totalCoins >= bet;
}

export function segmentShowsLabel(segment) {
  return segment.type !== 'nothing';
}

export function segmentLabelKey(segment) {
  if (segment.type === 'coins') return 'coins.wheel.segmentCoinMult';
  if (segment.type === 'free_spin') {
    return segment.multiplier > 1
      ? 'coins.wheel.segmentFreeSpinMulti'
      : 'coins.wheel.segmentFreeSpin';
  }
  return 'coins.wheel.segmentNothing';
}

export function segmentLabelParams(segment, bet) {
  if (segment.type === 'coins') {
    return { mult: segment.multiplier };
  }
  if (segment.type === 'free_spin' && segment.multiplier > 1) {
    return { count: segment.multiplier };
  }
  return {};
}

/** SVG wedge path for one layout segment (0° = top, clockwise). */
export function segmentPathFromLayout(segment, cx = 100, cy = 100, r = 92) {
  const start = (segment.startDeg - 90) * (Math.PI / 180);
  const end = (segment.startDeg + segment.sweepDeg - 90) * (Math.PI / 180);
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  const large = segment.sweepDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}

export function segmentLabelArcPath(segment, cx = 100, cy = 100, r = 83) {
  const startDeg = segment.startDeg;
  const endDeg = segment.startDeg + segment.sweepDeg;
  const start = (startDeg - 90) * (Math.PI / 180);
  const end = (endDeg - 90) * (Math.PI / 180);
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  const large = segment.sweepDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

export function segmentUsesRadialLabel(segment) {
  return Boolean(segment.shiny) || segment.sweepDeg < 14;
}

export function segmentShouldShowLabel(segment) {
  if (!segmentShowsLabel(segment)) return false;
  if (segment.shiny) return true;
  return segment.sweepDeg >= 10;
}

export function segmentTextPositionFromLayout(segment, cx = 100, cy = 100, r = 79) {
  const centerDeg = segment.startDeg + segment.sweepDeg / 2;
  const mid = (centerDeg - 90) * (Math.PI / 180);
  return {
    x: cx + r * Math.cos(mid),
    y: cy + r * Math.sin(mid),
    rotate: centerDeg,
    fontSize: segmentFontSize(segment),
  };
}

function segmentFontSize(segment) {
  const { sweepDeg, type, shiny } = segment;
  let size = 11;
  if (sweepDeg >= 40) size = 11;
  else if (sweepDeg >= 30) size = 10;
  else if (sweepDeg >= 20) size = 9;
  else if (sweepDeg >= 12) size = 8;
  else size = 7;

  if (shiny) size = Math.max(size, 8);
  if (type === 'free_spin') {
    size = Math.min(size, sweepDeg >= 22 ? 8 : 7);
  }
  return size;
}
