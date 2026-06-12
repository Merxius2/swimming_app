import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/router';
import { clearSwimData } from '../../lib/swimStorage';
import { useLanguage } from '../../context/UserPreferencesContext';
import { useSwim } from '../../context/SwimContext';
import ConfirmModal from '../ConfirmModal';

export default function ResetDataSection() {
  const { t } = useLanguage();
  const router = useRouter();
  const { clearAll } = useSwim();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const confirmReset = () => {
    try {
      clearAll();
      clearSwimData();
      setResetMessage(t('settings.success'));
      setShowConfirmation(false);
      setTimeout(() => router.reload(), 1500);
    } catch {
      setResetMessage(t('settings.error'));
    }
  };

  const isSuccess = resetMessage === t('settings.success');

  return (
    <>
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('settings.resetData')}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{t('settings.resetDesc')}</p>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800 dark:text-red-300">
            <strong>{t('settings.warning')}</strong>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowConfirmation(true)}
          className="inline-flex items-center space-x-2 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-all hover:bg-red-700 active:scale-95"
        >
          <Trash2 size={20} />
          <span>{t('settings.clearButton')}</span>
        </button>
        {resetMessage && (
          <div className={`mt-6 rounded-lg p-4 ${
            isSuccess
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}>
            <p className="font-medium">{resetMessage}</p>
          </div>
        )}
      </div>

      {showConfirmation && (
        <ConfirmModal
          title={t('settings.confirm')}
          message={t('settings.confirmDesc')}
          confirmLabel={t('settings.clearButton')}
          cancelLabel={t('settings.cancel')}
          onConfirm={confirmReset}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </>
  );
}
