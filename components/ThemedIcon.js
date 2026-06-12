import { useTheme } from '../context/UserPreferencesContext';
import { getThemeIconStyles } from '../lib/themeIconStyles';

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
  return <ThemedIcon icon={icon} variant="pageHeader" className={className} />;
}

/** Smaller in-card section icon (dashboard blocks, expense categories). */
export function ThemedInlineIcon({ icon, size, className = '' }) {
  return <ThemedIcon icon={icon} size={size} variant="inline" className={className} />;
}
