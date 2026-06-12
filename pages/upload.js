import { Upload as UploadIcon } from 'lucide-react';
import { useLanguage } from '../context/UserPreferencesContext';
import PageHeader from '../components/PageHeader';
import UploadFlow from '../components/upload/UploadFlow';

export default function UploadPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-white pb-32 lg:ml-64 md:pb-0">
      <PageHeader icon={UploadIcon} titleKey="upload.title" />
      <div className="max-w-3xl mx-auto space-y-6 px-4 py-8 md:px-8">
        <p className="text-ink-soft text-sm -mt-2 mb-4">{t('upload.subtitle')}</p>
        <UploadFlow />
      </div>
    </div>
  );
}
