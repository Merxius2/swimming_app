import { getBenchmarkForProfile, getSwimLevel } from './swimBenchmarks.js';
import { getMonthlyChallengeHistory, getMonthKey } from './swimMonthlyChallenges.js';

const MASCOT_IDS = ['flip', 'flo', 'fins'];

const getStatsSessions = (sessions) => (sessions || []).filter((session) => !session?.excludeFromStats);

const average = (values) => {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const PACE_LEVEL_RANK = {
  unknown: 0,
  developing: 0,
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

/** Unlock requirements: reach pace level OR earn enough monthly tier medals. */
export const MASCOT_UNLOCK_REQUIREMENTS = {
  flip: { minPaceLevel: null, minMonthlyMedals: 0 },
  flo: { minPaceLevel: 'intermediate', minMonthlyMedals: 5 },
  fins: { minPaceLevel: 'advanced', minMonthlyMedals: 10 },
};

export function getUserSwimPaceLevel(profile, sessions) {
  if (!profile?.sex || !profile?.age) return 'unknown';

  const statsSessions = getStatsSessions(sessions);
  if (!statsSessions.length) return 'unknown';

  const benchmark = getBenchmarkForProfile(profile.sex, profile.age);
  const paces = statsSessions
    .map((session) => session.metrics?.paceSecPer100m)
    .filter((pace) => pace != null);
  const pace = average(paces)
    ?? statsSessions[statsSessions.length - 1]?.metrics?.paceSecPer100m
    ?? null;

  if (pace == null) return 'unknown';
  return getSwimLevel(pace, benchmark);
}

export function countMonthlyMedals(sessions, monthlyChallengeRerolls = {}) {
  return getMonthlyChallengeHistory(sessions, { monthlyChallengeRerolls })
    .filter((entry) => entry.tier)
    .length;
}

export function meetsPaceRequirement(paceLevel, requiredLevel) {
  if (!requiredLevel) return true;
  return (PACE_LEVEL_RANK[paceLevel] || 0) >= (PACE_LEVEL_RANK[requiredLevel] || 0);
}

export function getMascotUnlockStatus(mascotId, { profile, sessions, monthlyChallengeRerolls = {} } = {}) {
  const requirements = MASCOT_UNLOCK_REQUIREMENTS[mascotId];
  if (!requirements) {
    return { unlocked: false, paceMet: false, medalsMet: false, paceLevel: 'unknown', monthlyMedals: 0 };
  }

  if (!requirements.minPaceLevel && !requirements.minMonthlyMedals) {
    return { unlocked: true, paceMet: true, medalsMet: true, paceLevel: 'beginner', monthlyMedals: 0 };
  }

  const paceLevel = getUserSwimPaceLevel(profile, sessions);
  const monthlyMedals = countMonthlyMedals(sessions, monthlyChallengeRerolls);
  const paceMet = meetsPaceRequirement(paceLevel, requirements.minPaceLevel);
  const medalsMet = monthlyMedals >= requirements.minMonthlyMedals;

  return {
    unlocked: paceMet || medalsMet,
    paceMet,
    medalsMet,
    paceLevel,
    monthlyMedals,
    requirements,
  };
}

export function isMascotUnlocked(mascotId, context) {
  return getMascotUnlockStatus(mascotId, context).unlocked;
}

export function getUnlockedMascotIds(context) {
  return MASCOT_IDS.filter((id) => isMascotUnlocked(id, context));
}

export function hasSessionsInMonth(sessions, monthKey = getMonthKey()) {
  return (sessions || []).some((session) => session.date?.startsWith(monthKey));
}

/**
 * Mascot switches are allowed once per calendar month, before the first swim
 * of that month (when new monthly goals are set).
 */
export function canSwitchMascot({
  profile,
  sessions,
  monthKey = getMonthKey(),
  nextMascotId,
  currentMascotId,
} = {}) {
  if (!nextMascotId || !MASCOT_IDS.includes(nextMascotId)) {
    return { allowed: false, reason: 'invalid' };
  }

  if (nextMascotId === currentMascotId) {
    return { allowed: true, reason: 'same' };
  }

  if (!isMascotUnlocked(nextMascotId, { profile, sessions })) {
    return { allowed: false, reason: 'locked' };
  }

  if (profile?.mascotSwitchMonthKey === monthKey) {
    return { allowed: false, reason: 'alreadySwitched' };
  }

  if (hasSessionsInMonth(sessions, monthKey)) {
    return { allowed: false, reason: 'afterFirstSession' };
  }

  return { allowed: true, reason: 'ok' };
}

export function resolveUnlockedMascotId(profile, context = {}) {
  const requested = profile?.mascotId;
  if (requested && MASCOT_IDS.includes(requested) && isMascotUnlocked(requested, context)) {
    return requested;
  }

  const legacy = profile?.mascotSex || profile?.sex;
  if (!requested && legacy === 'female' && isMascotUnlocked('flo', context)) {
    return 'flo';
  }

  return 'flip';
}

/** Resolve active mascot with unlock validation. */
export function resolveMascotId(profile, context = {}) {
  return resolveUnlockedMascotId(profile, {
    profile,
    sessions: context.sessions || [],
    monthlyChallengeRerolls: context.monthlyChallengeRerolls || {},
  });
}
