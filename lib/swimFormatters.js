export const parseDistanceM = (raw) => {
  if (raw == null || raw === '') return null;
  const cleaned = String(raw).replace(/\./g, '').replace(/[^\d]/g, '');
  const n = parseInt(cleaned, 10);
  return Number.isFinite(n) ? n : null;
};

export const parsePaceSecPer100m = (raw) => {
  if (raw == null || raw === '') return null;
  const str = String(raw);
  const match = str.match(/(\d+)['′](\d{1,2})/);
  if (match) {
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  }
  const secMatch = str.match(/^(\d+)$/);
  if (secMatch) return parseInt(secMatch[1], 10);
  return null;
};

export const formatPace = (secPer100m) => {
  if (secPer100m == null || !Number.isFinite(secPer100m)) return '—';
  const min = Math.floor(secPer100m / 60);
  const sec = Math.round(secPer100m % 60);
  return `${min}'${String(sec).padStart(2, '0')}"/100m`;
};

export const parseDurationSec = (raw) => {
  if (raw == null || raw === '') return null;
  const parts = String(raw).trim().split(':').map((p) => parseInt(p, 10));
  if (parts.some((p) => !Number.isFinite(p))) return null;
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return null;
};

export const formatDuration = (totalSec) => {
  if (totalSec == null || !Number.isFinite(totalSec)) return '—';
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.round(totalSec % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
};

export const formatDistance = (meters) => {
  if (meters == null || !Number.isFinite(meters)) return '—';
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(meters % 1000 === 0 ? 1 : 2).replace('.', ',')} km`;
  }
  return `${meters.toLocaleString('nl-NL')} m`;
};

export const formatDateShort = (isoDate, locale = 'nl-NL') => {
  if (!isoDate) return '—';
  try {
    return new Date(isoDate).toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return isoDate;
  }
};

export const formatDateLong = (isoDate, locale = 'nl-NL') => {
  if (!isoDate) return '—';
  try {
    return new Date(isoDate).toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return isoDate;
  }
};

/** Tight Y-axis domain for pace charts so session-to-session changes are visible. */
export const getPaceChartDomain = (paceValues) => {
  const paces = (paceValues || []).filter((p) => p != null && Number.isFinite(p));
  if (!paces.length) return undefined;

  const min = Math.min(...paces);
  const max = Math.max(...paces);
  const spread = max - min;
  const padding = spread === 0 ? 10 : Math.max(6, Math.ceil(spread * 0.25));

  return [Math.max(30, Math.floor(min - padding)), Math.ceil(max + padding)];
};
