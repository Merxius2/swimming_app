/** Swimmer profile helpers for coach copy and personalization. */

export function getSwimmerName(profile, t) {
  const name = profile?.name?.trim();
  return name || t('settings.defaultSwimmerName');
}

export function applyMessagePlaceholders(template, profile, t, extra = {}) {
  if (!template) return '';
  const replacements = {
    name: getSwimmerName(profile, t),
    swimmer: getSwimmerName(profile, t),
    ...extra,
  };
  return Object.entries(replacements).reduce(
    (str, [key, value]) => str.replace(new RegExp(`\\{${key}\\}`, 'g'), value ?? ''),
    template
  );
}

/** Settings preview line for the active mascot. */
export function buildMascotPreviewMessage(mascot, profile, t) {
  return applyMessagePlaceholders(t(mascot.previewKey), profile, t);
}

/** Prefix session coach copy with a mascot-specific greeting. */
export function wrapCoachMessage(mascotId, profile, t, message) {
  if (!message?.trim()) return message;
  const key = `mascot.coachWrap.${mascotId}`;
  const wrapped = t(key);
  if (!wrapped || wrapped === key) return message;
  return applyMessagePlaceholders(wrapped, profile, t, { message: message.trim() });
}
