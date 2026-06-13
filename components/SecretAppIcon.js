import { useSwim } from '../context/SwimContext';
import { resolveAppIconPath } from '../lib/storeAppIcons';
import SecretMenuTrigger from './SecretMenuTrigger';

export default function SecretAppIcon({ size = 32, className = '' }) {
  const { profile, storeUnlocks } = useSwim();
  const iconPath = resolveAppIconPath(profile?.activeAppIcon, storeUnlocks);

  return (
    <SecretMenuTrigger
      type="button"
      clicks={3}
      className={`rounded-full shrink-0 focus:outline-none ${className}`.trim()}
      aria-label="Aap-SC"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={iconPath}
        alt=""
        width={size}
        height={size}
        className="rounded-full"
      />
    </SecretMenuTrigger>
  );
}
