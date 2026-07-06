export const SWIM_STORAGE_KEY = 'AUDIT_SWIM_DATA';

export const DEFAULT_SWIM_DATA = {
  profile: {
    name: '',
    sex: 'male',
    age: 30,
    mascotId: null,
    aiApiKey: '',
    activeAmbient: null,
    swimmerTitle: null,
    activeAppIcon: null,
  },
  monthlySettlements: {},
  totalCoins: 0,
  coinsSpent: 0,
  sessions: [],
  spentCoinClaims: [],
  wheelSpins: null,
  challengeRerollCredits: 0,
  bonusWheelSpinCredits: 0,
  storeUnlocks: [],
  monthlyChallengeRerolls: {},
  /** @deprecated migrated into storeUnlocks */
  purchasedThemes: [],
};

export const SEX_OPTIONS = ['male', 'female'];

export const STROKE_KEYS = ['mixedM', 'breaststrokeM', 'freestyleM', 'backstrokeM', 'butterflyM'];

export const EMPTY_METRICS = {
  durationSec: null,
  distanceM: null,
  activeKcal: null,
  totalKcal: null,
  paceSecPer100m: null,
  avgHeartRate: null,
  laps: null,
  poolLengthM: 25,
  goalM: null,
  location: '',
  timeRange: '',
  strokes: {
    mixedM: null,
    breaststrokeM: null,
    freestyleM: null,
    backstrokeM: null,
    butterflyM: null,
  },
};

export const CHART_COLORS_SWIM = ['#3B5BFF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
