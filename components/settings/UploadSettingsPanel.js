import Link from 'next/link';
import { Upload as UploadIcon } from 'lucide-react';
import { useLanguage } from '../../context/UserPreferencesContext';
import ThemedIcon from '../ThemedIcon';

export default function UploadSettingsPanel() {
  const { t } = useLanguage();

  return (
    <div className="card p-8">
      <div className="flex items-center gap-3 mb-4">
        <ThemedIcon icon={UploadIcon} variant="section" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('settings.uploadTitle')}</h2>
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-6">{t('settings.uploadDesc')}</p>
      <Link href="/upload">
        <button type="button" className="px-6 py-3 rounded-full bg-brand text-white font-semibold">
          {t('settings.uploadCta')}
        </button>
      </Link>
    </div>
  );
}
