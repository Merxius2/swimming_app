import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../context/UserPreferencesContext';

export default function ResetDataModal({ open, sessionCount, onClose, onConfirm }) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [typed, setTyped] = useState('');

  const confirmPhrase = t('settings.resetConfirmPhrase');

  useEffect(() => {
    if (!open) {
      setStep(1);
      setTyped('');
    }
  }, [open]);

  if (!open) return null;

  const sessionLine = t('settings.resetSessionCount').replace('{count}', String(sessionCount));
  const phraseOk = typed.trim().toUpperCase() === confirmPhrase.trim().toUpperCase();

  const handleClose = () => {
    setStep(1);
    setTyped('');
    onClose();
  };

  const titles = [
    t('settings.resetStep1Title'),
    t('settings.resetStep2Title'),
    t('settings.resetStep3Title'),
  ];

  const messages = [
    `${t('settings.resetStep1Desc')} ${sessionLine}`,
    t('settings.resetStep2Desc'),
    t('settings.resetStep3Desc'),
  ];

  const continueLabels = [
    t('settings.resetStep1Continue'),
    t('settings.resetStep2Continue'),
    t('settings.clearButton'),
  ];

  const handleContinue = () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    if (phraseOk) onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-[99] p-4">
      <div className="card p-6 md:p-8 max-w-md w-full mx-auto" role="dialog" aria-modal="true">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={20} className="text-red-600 shrink-0" />
          <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
            {t('settings.resetProgress').replace('{step}', String(step)).replace('{total}', '3')}
          </p>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{titles[step - 1]}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-5">{messages[step - 1]}</p>

        {step === 3 && (
          <div className="mb-5">
            <label htmlFor="reset-confirm-input" className="block text-sm font-medium text-ink mb-2">
              {t('settings.resetTypePrompt').replace('{phrase}', confirmPhrase)}
            </label>
            <input
              id="reset-confirm-input"
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={t('settings.resetTypePlaceholder')}
              autoComplete="off"
              spellCheck={false}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-mono"
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {t('settings.cancel')}
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={step === 3 && !phraseOk}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {continueLabels[step - 1]}
          </button>
        </div>
      </div>
    </div>
  );
}
