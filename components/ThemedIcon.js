import { useTheme } from '../context/UserPreferencesContext';
import { useSwim } from '../context/SwimContext';
import { getThemeIconStyles } from '../lib/themeIconStyles';
import { getPageIconKey, resolveStorePageIconPath } from '../lib/storePageIcons';

/**
 * Theme-aware icon — optional chip wrapper per theme (page headers, settings, inline).
 */
export default function ThemedIcon({
  icon: Icon,
  size,
  variant = 'section',
  className = '',
}) {
  const { theme } = useTheme();
  const styles = getThemeIconStyles(theme, variant);
  const iconSize = size ?? styles.iconSize ?? 28;

  if (styles.wrapper) {
    return (
      <span className={`${styles.wrapper} ${className}`.trim()}>
        <Icon size={iconSize} className={styles.icon} />
      </span>
    );
  }

  return <Icon size={iconSize} className={`${styles.icon} ${className}`.trim()} />;
}

/** Page title icon chip (compact, beside h1). */
export function ThemedPageIcon({ icon, className = '' }) {
  const { profile, storeUnlocks } = useSwim();
  const pageKey = getPageIconKey(icon);
  const storeIconPath = resolveStorePageIconPath(profile?.activeAppIcon, pageKey, storeUnlocks);

  if (storeIconPath) {
    return (
      <span className={`inline-flex w-9 h-9 shrink-0 items-center justify-center ${className}`.trim()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={storeIconPath} alt="" width={36} height={36} className="w-9 h-9" />
      </span>
    );
  }

  return <ThemedIcon icon={icon} variant="pageHeader" className={className} />;
}

/** Smaller in-card section icon (dashboard blocks, expense categories). */
export function ThemedInlineIcon({ icon, size, className = '' }) {
  return <ThemedIcon icon={icon} size={size} variant="inline" className={className} />;
}
