import { useState } from 'react';
import { Download, Upload, Copy, Check } from 'lucide-react';
import { generateSwimExportString, parseSwimImportString } from '../../lib/swimImportExport';
import { useLanguage } from '../../context/UserPreferencesContext';
import { useSwim } from '../../context/SwimContext';
import ConfirmModal from '../ConfirmModal';
import ThemedIcon from '../ThemedIcon';

export default function ImportExportPanel() {
  const { t } = useLanguage();
  const { data, replaceData } = useSwim();
  const [exportString, setExportString] = useState('');
  const [importString, setImportString] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pendingImport, setPendingImport] = useState(null);

  const handleExport = async () => {
    try {
      setExportString(await generateSwimExportString(data));
      setImportMessage('');
    } catch (error) {
      setImportMessage(`Export error: ${error.message}`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(exportString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleImportClick = async () => {
    try {
      const parsed = await parseSwimImportString(importString);
      setPendingImport(parsed);
      setShowImportConfirm(true);
      setImportMessage('');
    } catch (error) {
      setImportMessage(error.message);
    }
  };

  const confirmImport = () => {
    if (pendingImport) {
      replaceData(pendingImport);
      setImportMessage(t('settings.importSuccess'));
      setImportString('');
      setShowImportConfirm(false);
      setPendingImport(null);
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <>
      <div className="card p-6 space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <ThemedIcon icon={Download} size={20} />
            <div>
              <h2 className="text-xl font-bold text-ink dark:text-gray-100">{t('settings.exportTitle')}</h2>
              <p className="text-sm text-ink-soft">{t('settings.exportDesc')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand text-white font-semibold hover:opacity-90"
          >
            <Download size={18} />
            {t('settings.exportButton')}
          </button>
          {exportString && (
            <div className="mt-4">
              <textarea
                readOnly
                value={exportString}
                rows={4}
                className="w-full p-3 text-xs font-mono rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="mt-2 inline-flex items-center gap-2 text-sm text-brand font-medium"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? t('settings.copied') : t('settings.copy')}
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex items-center gap-3 mb-4">
            <ThemedIcon icon={Upload} size={20} />
            <div>
              <h2 className="text-xl font-bold text-ink dark:text-gray-100">{t('settings.importTitle')}</h2>
              <p className="text-sm text-ink-soft">{t('settings.importDesc')}</p>
            </div>
          </div>
          <textarea
            value={importString}
            onChange={(e) => setImportString(e.target.value)}
            placeholder={t('settings.importPlaceholder')}
            rows={4}
            className="w-full p-3 text-xs font-mono rounded-lg border border-gray-200 dark:border-gray-700"
          />
          <button
            type="button"
            onClick={handleImportClick}
            disabled={!importString.trim()}
            className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-brand text-brand font-semibold hover:bg-tint-soft disabled:opacity-50"
          >
            <Upload size={18} />
            {t('settings.importButton')}
          </button>
        </div>

        {importMessage && (
          <p className="text-sm text-ink-soft">{importMessage}</p>
        )}
      </div>

      {showImportConfirm && (
        <ConfirmModal
          title={t('settings.importConfirm')}
          message={t('settings.importConfirmDesc')}
          confirmLabel={t('settings.importButton')}
          cancelLabel={t('settings.cancel')}
          onConfirm={confirmImport}
          onCancel={() => setShowImportConfirm(false)}
        />
      )}
    </>
  );
}
