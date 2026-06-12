/**
 * Tool Tile Component - Landing page tool card
 */

import Link from 'next/link';
import { useLanguage, useTheme } from '../context/UserPreferencesContext';
import { getThemeTileIconStyles } from '../lib/themeIconStyles';

export default function ToolTile({ href, icon: Icon, titleKey, idx, tint }) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const c = getThemeTileIconStyles(theme, tint);

  return (
    <Link href={href}>
      <div className="spring glass rounded-md p-4 cursor-pointer h-full">
        <div className="flex items-center justify-between mb-10">
          <span className={`inline-flex w-9 h-9 items-center justify-center rounded-full ${c.bg} ${c.fg}`}>
            <Icon size={17} />
          </span>
          <span className="text-[10px] mono text-ink-faint">{idx}</span>
        </div>
        <p className="text-[14px] font-semibold tracking-tight">{t(titleKey)}</p>
      </div>
    </Link>
  );
}
