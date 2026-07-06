/** Mascot cosmetic slots — one equipped item per slot. */
export const MASCOT_SLOTS = ['head', 'face', 'neck', 'back'];

export const MASCOT_SLOT_BY_ITEM = {
  'mascot:neon-cap': 'head',
  'mascot:party-hat': 'head',
  'mascot:gold-goggles': 'face',
  'mascot:snorkel': 'face',
  'mascot:medal-chain': 'neck',
  'mascot:champion-cape': 'back',
};

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

export function getMascotSlot(itemId) {
  return MASCOT_SLOT_BY_ITEM[itemId] || null;
}

export function normalizeMascotEquipped(raw, storeUnlocks = []) {
  const owned = new Set(
    (storeUnlocks || []).filter((id) => id.startsWith('mascot:'))
  );
  const slotsUsed = new Set();
  const result = [];

  if (!Array.isArray(raw)) return result;

  raw.forEach((id) => {
    if (!owned.has(id)) return;
    const slot = getMascotSlot(id);
    if (!slot || slotsUsed.has(slot)) return;
    slotsUsed.add(slot);
    result.push(id);
  });

  return result;
}

export function equipMascotItem(currentEquipped, itemId, storeUnlocks = []) {
  const owned = (storeUnlocks || []).includes(itemId);
  if (!owned) return normalizeMascotEquipped(currentEquipped, storeUnlocks);

  const slot = getMascotSlot(itemId);
  if (!slot) return normalizeMascotEquipped(currentEquipped, storeUnlocks);

  const withoutSlot = (currentEquipped || []).filter((id) => getMascotSlot(id) !== slot);
  return normalizeMascotEquipped([...withoutSlot, itemId], storeUnlocks);
}

export function unequipMascotItem(currentEquipped, itemId, storeUnlocks = []) {
  return normalizeMascotEquipped(
    (currentEquipped || []).filter((id) => id !== itemId),
    storeUnlocks
  );
}
