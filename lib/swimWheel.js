/** Wheel of fortune — bet amounts, segments, and spin resolution. */

export const WHEEL_BETS = [1, 10, 100];

/** Minimum share of the wheel for both "nothing" slices combined. */
export const MIN_NOTHING_SHARE = 0.5;

/** Minimum weight for bet-scaled prize slice at low bets. */
export const MIN_BET_SEGMENT_WEIGHT = 5;

/** Extra nothing share at low bets (fades to 0 by bet 100). */
export const NOTHING_LOW_BET_BONUS = 0.05;

export const WHEEL_SEGMENT_DEFS = [
  { id: 'coins-2', type: 'coins', multiplier: 2, color: '#F59E0B', weight: 12 },
  { id: 'nothing', type: 'nothing', color: '#71717A' },
  { id: 'coins-3', type: 'coins', multiplier: 3, color: '#FBBF24', weight: 12 },
  { id: 'prize', type: 'prize', color: '#EC4899', weightKey: 'bet' },
  { id: 'coins-5', type: 'coins', multiplier: 5, color: '#F59E0B', weight: 10 },
  { id: 'free', type: 'free_spin', color: '#7B5BFF', weight: 10 },
  { id: 'nothing-2', type: 'nothing', color: '#52525B' },
  { id: 'free-2', type: 'free_spin', color: '#6366F1', weight: 10 },
];

export function betSegmentWeight(bet) {
  return Math.max(bet, MIN_BET_SEGMENT_WEIGHT);
}

/** Combined share for both nothing slices — at least 50%, slightly larger on small bets. */
export function nothingCombinedShare(bet) {
  const lowBetBonus = NOTHING_LOW_BET_BONUS * Math.max(0, 2 - Math.log10(bet));
  return MIN_NOTHING_SHARE + lowBetBonus;
}

export function nonNothingWeight(def, bet) {
  if (def.weightKey === 'bet') return betSegmentWeight(bet);
  return def.weight ?? 1;
}

/** Build wheel layout — nothing always fills ≥50%, prize scales with bet. */
export function buildWheelLayout(bet) {
  const nothingShare = nothingCombinedShare(bet);
  const otherShare = 1 - nothingShare;

  const otherWeights = WHEEL_SEGMENT_DEFS.map((def) =>
    (def.type === 'nothing' ? 0 : nonNothingWeight(def, bet))
  );
  const otherTotal = otherWeights.reduce((sum, weight) => sum + weight, 0);
  const nothingTotal = otherTotal * (nothingShare / otherShare);
  const nothingEach = nothingTotal / 2;

  const weights = WHEEL_SEGMENT_DEFS.map((def, index) =>
    (def.type === 'nothing' ? nothingEach : otherWeights[index])
  );
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

/**
 * Apply a wheel outcome after the bet was already deducted (unless free spin).
 * @returns {{ coinsDelta: number, freeSpin: boolean, type: string, multiplier?: number }}
 */
export function resolveWheelOutcome(segment, bet) {
  if (!segment) {
    return { coinsDelta: 0, freeSpin: false, type: 'unknown' };
  }

  switch (segment.type) {
    case 'coins':
      return {
        type: 'coins',
        multiplier: segment.multiplier,
        coinsDelta: bet * segment.multiplier,
        freeSpin: false,
      };
    case 'free_spin':
      return {
        type: 'free_spin',
        coinsDelta: bet,
        freeSpin: true,
      };
    case 'prize':
      return {
        type: 'prize',
        coinsDelta: 0,
        freeSpin: false,
      };
    case 'nothing':
      return {
        type: 'nothing',
        coinsDelta: 0,
        freeSpin: false,
        amountLost: bet,
      };
    default:
      return { coinsDelta: 0, freeSpin: false, type: 'unknown' };
  }
}

export function canAffordSpin(totalCoins, bet, hasFreeSpin) {
  return hasFreeSpin || totalCoins >= bet;
}

export function segmentLabelKey(segment) {
  if (segment.type === 'coins') return 'coins.wheel.segmentCoins';
  if (segment.type === 'free_spin') return 'coins.wheel.segmentFreeSpin';
  if (segment.type === 'nothing') return 'coins.wheel.segmentNothing';
  return 'coins.wheel.segmentPrize';
}

export function segmentLabelParams(segment, bet) {
  if (segment.type === 'coins') {
    return { amount: bet * segment.multiplier };
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

export function segmentTextPositionFromLayout(segment, cx = 100, cy = 100, r = 58) {
  const centerDeg = segment.startDeg + segment.sweepDeg / 2;
  const mid = (centerDeg - 90) * (Math.PI / 180);
  return {
    x: cx + r * Math.cos(mid),
    y: cy + r * Math.sin(mid),
    rotate: centerDeg,
    fontSize: segmentFontSize(segment.sweepDeg),
  };
}

function segmentFontSize(sweepDeg) {
  if (sweepDeg >= 40) return 11;
  if (sweepDeg >= 24) return 10;
  if (sweepDeg >= 14) return 9;
  return 8;
}
