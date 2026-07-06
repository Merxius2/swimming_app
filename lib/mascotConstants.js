/**
 * Flip, Flo & Fins — the swim-coach monkey mascots.
 * Full-body artwork lives in /public/mascot/ with an open-eyes and a
 * closed-eyes (blink) frame per character.
 */
export const MASCOTS = {
  flip: {
    id: 'flip',
    nameKey: 'settings.mascotFlipName',
    descKey: 'settings.mascotFlipDesc',
    rulesKey: 'settings.mascotFlipRules',
    coachedLevel: 'beginner',
    traitKeys: ['mascot.traits.encouraging', 'mascot.traits.approachable'],
    cheerKey: 'mascot.cheerFlip',
    previewKey: 'settings.mascotPreviewFlip',
    // English personality descriptor injected into the AI coach prompt
    aiPersonality: 'encouraging and approachable — celebrates effort, keeps things light, always positive, never criticises',
    images: {
      open: '/mascot/flip-open.png',
      closed: '/mascot/flip-closed.png',
    },
    stageBg: '/mascot/flip-stage-bg.png',
    // natural width / height of the artwork
    aspect: 490 / 900,
    gameplay: {
      challengeIntensity: 0.75, // easier monthly challenge targets
      coinMultiplier: 0.5,      // half coins…
      minSessionCoins: 3,       // …but you can never lose any
      sessionPenalty: false,
      requiredMonthlyTier: null,
      monthlyPenaltyCoins: 0,
      freeMonthlyRerolls: 1,
      positiveOnly: true,
      doubleImprovementBonus: false,
    },
  },
  flo: {
    id: 'flo',
    nameKey: 'settings.mascotFloName',
    descKey: 'settings.mascotFloDesc',
    rulesKey: 'settings.mascotFloRules',
    coachedLevel: 'intermediate',
    traitKeys: ['mascot.traits.friendly', 'mascot.traits.motivating'],
    cheerKey: 'mascot.cheerFlo',
    previewKey: 'settings.mascotPreviewFlo',
    aiPersonality: 'friendly and motivating — warm and enthusiastic, cheers milestones, but honestly points out when statistics decline',
    images: {
      open: '/mascot/flo-open.png',
      closed: '/mascot/flo-closed.png',
      disappointedOpen: '/mascot/flo-disappointed-open.png',
      disappointedClosed: '/mascot/flo-closed.png',
    },
    stageBg: '/mascot/flo-stage-bg.png',
    aspect: 593 / 900,
    gameplay: {
      challengeIntensity: 1,
      coinMultiplier: 1,
      minSessionCoins: 5,
      sessionPenalty: false,
      requiredMonthlyTier: 'silver', // ending a month below silver costs coins
      monthlyPenaltyCoins: 40,
      freeMonthlyRerolls: 1,
      positiveOnly: false,
      doubleImprovementBonus: false,
    },
  },
  fins: {
    id: 'fins',
    nameKey: 'settings.mascotFinsName',
    descKey: 'settings.mascotFinsDesc',
    rulesKey: 'settings.mascotFinsRules',
    coachedLevel: 'advanced',
    traitKeys: ['mascot.traits.focused', 'mascot.traits.challenging'],
    cheerKey: 'mascot.cheerFins',
    previewKey: 'settings.mascotPreviewFins',
    aiPersonality: 'focused and challenging — a demanding performance coach who is direct, critical but fair, always pushes for measurable improvement and calls out slacking',
    images: {
      open: '/mascot/fins-open.png',
      closed: '/mascot/fins-closed.png',
      disappointedOpen: '/mascot/fins-disappointed-open.png',
      disappointedClosed: '/mascot/fins-disappointed-closed.png',
    },
    stageBg: '/mascot/fins-stage-bg.png',
    aspect: 512 / 900,
    gameplay: {
      challengeIntensity: 1.25,  // hardest monthly challenge targets
      coinMultiplier: 1,
      minSessionCoins: null,     // sessions can go negative when you slack
      sessionPenalty: true,
      requiredMonthlyTier: 'gold', // ending a month below gold costs coins
      monthlyPenaltyCoins: 75,
      freeMonthlyRerolls: 2,     // compromise: two rerolls instead of one
      positiveOnly: false,
      doubleImprovementBonus: true,
    },
  },
};

export const MASCOT_IDS = ['flip', 'flo', 'fins'];

export function getMascot(id) {
  return MASCOTS[id] || MASCOTS.flip;
}

import { resolveMascotId } from './mascotUnlock.js';

export { resolveMascotId };

export function getMascotName(id, t) {
  return t(getMascot(id).nameKey);
}

export function getMascotGameplay(id) {
  return getMascot(id).gameplay;
}

/** Coach tier shown on the mascot badge (Flip → beginner, Flo → intermediate, Fins → advanced). */
export function getMascotCoachedLevel(id) {
  return getMascot(id).coachedLevel || 'beginner';
}

export const MASCOT_LEVEL_MAP = {
  advanced: 'advanced',
  intermediate: 'intermediate',
  beginner: 'beginner',
  developing: 'beginner',
  unknown: 'beginner',
};

export function resolveMascotLevel(benchmarkLevel) {
  return MASCOT_LEVEL_MAP[benchmarkLevel] || 'beginner';
}
