import { useSwim } from '../context/SwimContext';
import { resolveStorePageIconPath } from '../lib/storePageIcons';

/** Navigation/page icon — uses active icon set when owned, otherwise Lucide. */
export default function NavPageIcon({ icon: Icon, pageKey, size = 17, strokeWidth = 2, className = '' }) {
  const { profile, storeUnlocks } = useSwim();
  const storeIconPath = resolveStorePageIconPath(profile?.activeAppIcon, pageKey, storeUnlocks);

  if (storeIconPath) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={storeIconPath}
        alt=""
        width={size}
        height={size}
        className={`shrink-0 ${className}`.trim()}
        style={{ width: size, height: size }}
      />
    );
  }

  return <Icon size={size} strokeWidth={strokeWidth} className={className} />;
}
