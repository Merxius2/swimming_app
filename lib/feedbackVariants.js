/** Deterministic variant picker so feedback feels varied without being random each render. */
export function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function pickVariantKey(baseKey, count, seed) {
  if (count <= 1) return baseKey;
  const idx = hashSeed(String(seed)) % count;
  return idx === 0 ? baseKey : `${baseKey}${idx + 1}`;
}

export function trVariant(tr, baseKey, count, seed, params = {}) {
  const key = pickVariantKey(baseKey, count, seed);
  const text = tr(key, params);
  if (!text || text === key) return tr(baseKey, params);
  return text;
}
