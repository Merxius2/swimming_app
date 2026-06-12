import Image from 'next/image';
import { useLanguage } from '../context/UserPreferencesContext';
import { LANGUAGE_FAVICON_MAP } from '../lib/appConstants';
import SecretMenuTrigger from './SecretMenuTrigger';

export default function SecretAppIcon({ size = 32, className = '' }) {
  const { language } = useLanguage();
  const iconPath = LANGUAGE_FAVICON_MAP[language] || LANGUAGE_FAVICON_MAP.en;

  return (
    <SecretMenuTrigger
      type="button"
      clicks={3}
      className={`rounded-full shrink-0 focus:outline-none ${className}`.trim()}
      aria-label="Aap-SC"
    >
      <Image src={iconPath} alt="" width={size} height={size} className="rounded-full" />
    </SecretMenuTrigger>
  );
}
