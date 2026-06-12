import { formatDistance } from './swimFormatters';

export const formatChallengeValue = (type, value, t) => {
  if (value == null) return '—';
  switch (type) {
    case 'sessions':
    case 'streak':
    case 'active_weeks':
      return String(value);
    case 'distance':
      return formatDistance(value);
    case 'kcal':
      return `${value.toLocaleString()} ${t('common.kcal')}`;
    default:
      return String(value);
  }
};

export const formatChallengeTarget = (type, target, t) => {
  switch (type) {
    case 'sessions':
      return t('monthlyChallenges.targets.sessions').replace('{count}', String(target));
    case 'distance':
      return t('monthlyChallenges.targets.distance').replace('{distance}', formatDistance(target));
    case 'kcal':
      return t('monthlyChallenges.targets.kcal').replace('{kcal}', String(target));
    case 'streak':
      return t('monthlyChallenges.targets.streak').replace('{days}', String(target));
    case 'active_weeks':
      return t('monthlyChallenges.targets.activeWeeks').replace('{weeks}', String(target));
    default:
      return String(target);
  }
};

export const tr = (t, key, params) => {
  let str = t(key);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, String(v));
    });
  }
  return str;
};
