import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, X } from 'lucide-react';
import { useLanguage } from '../../context/UserPreferencesContext';

const TIER_GRADIENT = {
  bronze: 'from-amber-700 to-amber-500',
  silver: 'from-gray-400 to-gray-300',
  gold: 'from-yellow-500 to-amber-400',
};

export default function MedalCelebrationModal({ medals, onClose }) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !medals?.length) return null;

  const tr = (key, params) => {
    let str = t(key);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v));
      });
    }
    return str;
  };

  const modal = (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label={t('medals.celebration.close')}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="medal-celebration-title"
        className="relative w-full max-w-md card p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-ink-faint hover:text-ink hover:bg-black/[0.05]"
          aria-label={t('medals.celebration.close')}
        >
          <X size={20} />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-3xl shadow-lg mb-3">
            🏆
          </div>
          <h2 id="medal-celebration-title" className="text-xl font-bold text-ink">
            {medals.length === 1 ? t('medals.celebration.title') : t('medals.celebration.titleMultiple')}
          </h2>
          <p className="text-sm text-ink-soft mt-1">
            {medals.length === 1
              ? t('medals.celebration.subtitleOne')
              : tr('medals.celebration.subtitleMultiple', { count: medals.length })}
          </p>
        </div>

        <ul className="space-y-3 max-h-[45vh] overflow-y-auto mb-6">
          {medals.map((medal) => (
            <li
              key={medal.id}
              className="flex items-start gap-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-black/[0.02] dark:bg-white/[0.03] p-3"
            >
              <div
                className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-lg bg-gradient-to-br shadow-inner ${
                  TIER_GRADIENT[medal.tier] || TIER_GRADIENT.bronze
                }`}
              >
                🏅
              </div>
              <div className="min-w-0 text-left">
                <p className="font-semibold text-sm text-ink">{t(`medals.items.${medal.id}.title`)}</p>
                <p className="text-xs text-ink-soft mt-0.5">{t(`medals.items.${medal.id}.desc`)}</p>
                <p className="text-xs text-brand mt-1.5 italic leading-relaxed">
                  {t(`medals.celebration.motivation.${medal.tier}`)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex gap-3">
          <Link href="/medals" className="flex-1" onClick={onClose}>
            <button
              type="button"
              className="w-full py-3 rounded-lg border border-gray-200 dark:border-gray-700 font-medium text-sm"
            >
              <span className="inline-flex items-center justify-center gap-1.5">
                <Award size={16} />
                {t('medals.celebration.viewMedals')}
              </span>
            </button>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-lg text-white font-semibold text-sm shadow-pill-tint"
            style={{ background: 'linear-gradient(135deg,#3B5BFF 0%, #7B5BFF 100%)' }}
          >
            {t('medals.celebration.continue')}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
