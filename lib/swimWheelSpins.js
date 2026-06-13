/** Daily paid spin limit for the wheel of fortune. */

export const DAILY_PAID_SPIN_LIMIT = 3;

export function getWheelSpinDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function normalizeWheelSpins(wheelSpins, today = getWheelSpinDayKey()) {
  if (!wheelSpins || wheelSpins.date !== today) {
    return { date: today, paidCount: 0 };
  }
  return {
    date: today,
    paidCount: Math.max(0, Number(wheelSpins.paidCount) || 0),
  };
}

export function getPaidSpinsUsedToday(wheelSpins, today = getWheelSpinDayKey()) {
  return normalizeWheelSpins(wheelSpins, today).paidCount;
}

export function getPaidSpinsRemaining(
  wheelSpins,
  today = getWheelSpinDayKey(),
  dailyLimit = DAILY_PAID_SPIN_LIMIT
) {
  const used = getPaidSpinsUsedToday(wheelSpins, today);
  return Math.max(0, dailyLimit - used);
}

export function canUsePaidSpin(
  wheelSpins,
  today = getWheelSpinDayKey(),
  dailyLimit = DAILY_PAID_SPIN_LIMIT
) {
  return getPaidSpinsRemaining(wheelSpins, today, dailyLimit) > 0;
}

export function recordPaidSpin(wheelSpins, today = getWheelSpinDayKey()) {
  const normalized = normalizeWheelSpins(wheelSpins, today);
  return {
    date: normalized.date,
    paidCount: normalized.paidCount + 1,
  };
}

/** Whether the user can spin (paid or free). */
export function canStartWheelSpin(
  totalCoins,
  bet,
  freeSpins,
  wheelSpins,
  today = getWheelSpinDayKey(),
  dailyLimit = DAILY_PAID_SPIN_LIMIT
) {
  if (freeSpins > 0) return true;
  if (!canUsePaidSpin(wheelSpins, today, dailyLimit)) return false;
  return totalCoins >= bet;
}
