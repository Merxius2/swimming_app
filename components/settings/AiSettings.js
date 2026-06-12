import { useState } from 'react';
import { Bot, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../../context/UserPreferencesContext';
import { useSwim } from '../../context/SwimContext';
import ThemedIcon from '../ThemedIcon';

export default function AiSettings() {
  const { t } = useLanguage();
  const { profile, updateProfile } = useSwim();
  const [showKey, setShowKey] = useState(false);
  const [localKey, setLocalKey] = useState(profile.aiApiKey || '');

  const saveKey = () => {
    updateProfile({ aiApiKey: localKey.trim() });
  };

  const clearKey = () => {
    setLocalKey('');
    updateProfile({ aiApiKey: '' });
  };

  const hasKey = Boolean(profile.aiApiKey?.trim());

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <ThemedIcon icon={Bot} size={20} />
        <div>
          <h2 className="text-xl font-bold text-ink dark:text-gray-100">{t('settings.aiTitle')}</h2>
          <p className="text-sm text-ink-soft">{t('settings.aiDesc')}</p>
        </div>
      </div>

      <p className="text-sm text-ink-soft mb-4">{t('settings.aiHint')}</p>

      <div className="relative mb-3">
        <input
          type={showKey ? 'text' : 'password'}
          value={localKey}
          onChange={(e) => setLocalKey(e.target.value)}
          placeholder={t('settings.aiPlaceholder')}
          className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-mono text-sm"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setShowKey((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
          aria-label={showKey ? 'Hide key' : 'Show key'}
        >
          {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={saveKey}
          className="px-5 py-2.5 rounded-lg text-white font-semibold shadow-pill-tint"
          style={{ background: 'linear-gradient(135deg,#3B5BFF 0%, #7B5BFF 100%)' }}
        >
          {t('settings.aiSave')}
        </button>
        {hasKey && (
          <button
            type="button"
            onClick={clearKey}
            className="px-5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 font-medium"
          >
            {t('settings.aiClear')}
          </button>
        )}
      </div>

      <p className={`mt-3 text-xs ${hasKey ? 'text-green-600 dark:text-green-400' : 'text-ink-faint'}`}>
        {hasKey ? t('settings.aiActive') : t('settings.aiInactive')}
      </p>
    </div>
  );
}
