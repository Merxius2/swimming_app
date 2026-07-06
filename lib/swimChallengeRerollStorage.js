import {
  createMonthlyChallengeReroll,
  canRerollMonthlyChallenge,
  normalizeMonthRerollEntry,
} from './swimMonthlyChallenges.js';
import { getMascotGameplay, resolveMascotId } from './mascotConstants.js';
import {
  purchaseConsumableStoreItemUpdate,
  isConsumableStoreItem,
  CHALLENGE_REROLL_STORE_ITEM_ID,
  BONUS_WHEEL_SPIN_STORE_ITEM_ID,
} from './swimCoinStore.js';

/** @returns {{ success: boolean, data: object }} */
export function applyMonthlyChallengeReroll(prev, monthKey, tierIndex) {
  const credits = prev.challengeRerollCredits || 0;
  const gameplay = getMascotGameplay(resolveMascotId(prev.profile));
  if (!canRerollMonthlyChallenge(
    prev.sessions,
    monthKey,
    tierIndex,
    prev.monthlyChallengeRerolls,
    credits,
    { intensity: gameplay.challengeIntensity, freeLimit: gameplay.freeMonthlyRerolls }
  )) {
    return { success: false, data: prev };
  }

  const override = createMonthlyChallengeReroll(
    prev.sessions,
    monthKey,
    tierIndex,
    prev.monthlyChallengeRerolls
  );
  if (!override) return { success: false, data: prev };

  const monthEntry = normalizeMonthRerollEntry(prev.monthlyChallengeRerolls?.[monthKey]);
  const useFree = monthEntry.freeUses < gameplay.freeMonthlyRerolls;
  if (!useFree && credits < 1) return { success: false, data: prev };

  return {
    success: true,
    data: {
      ...prev,
      challengeRerollCredits: useFree ? credits : credits - 1,
      monthlyChallengeRerolls: {
        ...(prev.monthlyChallengeRerolls || {}),
        [monthKey]: {
          overrides: { ...monthEntry.overrides, [tierIndex]: override.type },
          freeUses: monthEntry.freeUses + (useFree ? 1 : 0),
        },
      },
    },
  };
}

/** @returns {{ purchased: boolean, data: object }} */
export function applyConsumableStorePurchase(prev, itemId) {
  if (!isConsumableStoreItem(itemId)) {
    return { purchased: false, data: prev };
  }

  const update = purchaseConsumableStoreItemUpdate(
    itemId,
    prev.totalCoins || 0,
    prev.coinsSpent || 0
  );
  if (!update) return { purchased: false, data: prev };

  return {
    purchased: true,
    data: {
      ...prev,
      totalCoins: update.totalCoins,
      coinsSpent: update.coinsSpent,
      challengeRerollCredits: itemId === CHALLENGE_REROLL_STORE_ITEM_ID
        ? (prev.challengeRerollCredits || 0) + 1
        : (prev.challengeRerollCredits || 0),
      bonusWheelSpinCredits: itemId === BONUS_WHEEL_SPIN_STORE_ITEM_ID
        ? (prev.bonusWheelSpinCredits || 0) + 1
        : (prev.bonusWheelSpinCredits || 0),
    },
  };
}
