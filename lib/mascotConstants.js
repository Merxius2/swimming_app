/** Mascot cosmetic slots — one equipped item per slot. */
export const MASCOT_SLOTS = ['head', 'face', 'neck', 'back', 'outfit'];

export const MASCOT_CHARACTERS = {
  male: {
    id: 'flip',
    nameKey: 'settings.mascotFlipName',
    descKey: 'settings.mascotFlipDesc',
  },
  female: {
    id: 'flo',
    nameKey: 'settings.mascotFloName',
    descKey: 'settings.mascotFloDesc',
  },
};

export function resolveMascotSex(profile) {
  return profile?.mascotSex || profile?.sex || 'male';
}

export function getMascotName(sex, t) {
  const character = MASCOT_CHARACTERS[sex === 'female' ? 'female' : 'male'];
  return t(character.nameKey);
}

export function getMascotDesc(sex, t) {
  const character = MASCOT_CHARACTERS[sex === 'female' ? 'female' : 'male'];
  return t(character.descKey);
}

export const MASCOT_SLOT_BY_ITEM = {
  'mascot:neon-cap': 'head',
  'mascot:party-hat': 'head',
  'mascot:gold-goggles': 'face',
  'mascot:snorkel': 'face',
  'mascot:medal-chain': 'neck',
  'mascot:champion-cape': 'back',
  'mascot:suit-classic': 'outfit',
  'mascot:suit-racing': 'outfit',
  'mascot:suit-tropical': 'outfit',
  'mascot:shorts-classic': 'outfit',
  'mascot:shorts-jammer': 'outfit',
  'mascot:shorts-sunset': 'outfit',
};

/** null = unisex; otherwise only shown/equippable for that mascot sex */
export const MASCOT_ITEM_SEX = {
  'mascot:suit-classic': 'female',
  'mascot:suit-racing': 'female',
  'mascot:suit-tropical': 'female',
  'mascot:shorts-classic': 'male',
  'mascot:shorts-jammer': 'male',
  'mascot:shorts-sunset': 'male',
};

export function getMascotItemSex(itemId) {
  return MASCOT_ITEM_SEX[itemId] || null;
}

export function isMascotItemForSex(itemId, mascotSex) {
  const required = getMascotItemSex(itemId);
  if (!required) return true;
  return required === mascotSex;
}

export function getMascotPreviewSex(itemId, fallbackSex = 'male') {
  return getMascotItemSex(itemId) || fallbackSex;
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

export function getMascotSlot(itemId) {
  return MASCOT_SLOT_BY_ITEM[itemId] || null;
}

export function normalizeMascotEquipped(raw, storeUnlocks = [], mascotSex = 'male') {
  const owned = new Set(
    (storeUnlocks || []).filter((id) => id.startsWith('mascot:'))
  );
  const slotsUsed = new Set();
  const result = [];

  if (!Array.isArray(raw)) return result;

  raw.forEach((id) => {
    if (!owned.has(id)) return;
    if (!isMascotItemForSex(id, mascotSex)) return;
    const slot = getMascotSlot(id);
    if (!slot || slotsUsed.has(slot)) return;
    slotsUsed.add(slot);
    result.push(id);
  });

  return result;
}

export function equipMascotItem(currentEquipped, itemId, storeUnlocks = [], mascotSex = 'male') {
  const owned = (storeUnlocks || []).includes(itemId);
  if (!owned) return normalizeMascotEquipped(currentEquipped, storeUnlocks, mascotSex);
  if (!isMascotItemForSex(itemId, mascotSex)) {
    return normalizeMascotEquipped(currentEquipped, storeUnlocks, mascotSex);
  }

  const slot = getMascotSlot(itemId);
  if (!slot) return normalizeMascotEquipped(currentEquipped, storeUnlocks, mascotSex);

  const withoutSlot = (currentEquipped || []).filter((id) => getMascotSlot(id) !== slot);
  return normalizeMascotEquipped([...withoutSlot, itemId], storeUnlocks, mascotSex);
}

export function unequipMascotItem(currentEquipped, itemId, storeUnlocks = [], mascotSex = 'male') {
  return normalizeMascotEquipped(
    (currentEquipped || []).filter((id) => id !== itemId),
    storeUnlocks,
    mascotSex
  );
}
