import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, X } from 'lucide-react';
import { useLanguage } from '../../context/UserPreferencesContext';
import { formatDateLong } from '../../lib/swimFormatters';
import MedalIcon from './MedalIcon';
import Confetti from './Confetti';

const TIER_PANEL = {
  bronze: 'medal-celebration-tier-bronze',
  silver: 'medal-celebration-tier-silver',
  gold: 'medal-celebration-tier-gold',
};

const TIER_ITEM = {
  bronze: 'medal-celebration-item-bronze',
  silver: 'medal-celebration-item-silver',
  gold: 'medal-celebration-item-gold',
};

export default function MedalCelebrationModal({ medals, onClose }) {
  const { t, language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return undefined;
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [mounted]);

  if (!mounted || !medals?.length) return null;

  const locale = language === 'nl' ? 'nl-NL' : language === 'ru' ? 'ru-RU' : language === 'tr' ? 'tr-TR' : 'en-US';

  const tr = (key, params) => {
    let str = t(key);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v));
      });
    }
    return str;
  };

  const primaryTier = medals.reduce(
    (best, m) => (m.tier === 'gold' || (m.tier === 'silver' && best !== 'gold') ? m.tier : best),
    medals[0]?.tier || 'bronze'
  );

  const modal = (
    <>
      {visible && <Confetti active particleCount={140} duration={6000} />}
      <div
        className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 ${
          visible ? 'medal-celebration-backdrop-in' : 'opacity-0'
        }`}
      >
        <button
          type="button"
          className="absolute inset-0 z-0 bg-black/55 backdrop-blur-sm"
          aria-label={t('medals.celebration.close')}
          onClick={onClose}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="medal-celebration-title"
          className={`relative z-10 w-full max-w-md p-[3px] rounded-2xl medal-celebration-panel ${
            TIER_PANEL[primaryTier] || TIER_PANEL.gold
          } ${visible ? 'medal-celebration-panel-in' : 'scale-90 opacity-0'}`}
        >
          <div className="relative card p-6 shadow-2xl rounded-[14px] overflow-hidden">
            <div className="medal-celebration-shimmer pointer-events-none absolute inset-0" aria-hidden="true" />

            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-1 rounded-full text-ink-faint hover:text-ink hover:bg-black/[0.05]"
              aria-label={t('medals.celebration.close')}
            >
              <X size={20} />
            </button>

            <div className="text-center mb-5 relative">
              <div className="inline-flex items-center justify-center mb-3 medal-celebration-trophy">
                <MedalIcon id={medals[0].id} tier={medals[0].tier} size={72} animate />
              </div>
              <h2 id="medal-celebration-title" className="text-xl font-bold text-ink medal-celebration-title-glow">
                {medals.length === 1 ? t('medals.celebration.title') : t('medals.celebration.titleMultiple')}
              </h2>
              <p className="text-sm text-ink-soft mt-1">
                {medals.length === 1
                  ? t('medals.celebration.subtitleOne')
                  : tr('medals.celebration.subtitleMultiple', { count: medals.length })}
              </p>
            </div>

            <ul className="space-y-3 max-h-[45vh] overflow-y-auto mb-6 relative">
              {medals.map((medal, index) => (
                <li
                  key={medal.id}
                  className={`medal-celebration-item flex items-start gap-3 rounded-xl border-2 p-3 ${
                    TIER_ITEM[medal.tier] || TIER_ITEM.bronze
                  }`}
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <MedalIcon id={medal.id} tier={medal.tier} size={52} animate />
                  <div className="min-w-0 text-left">
                    <p className="font-semibold text-sm text-ink">{t(`medals.items.${medal.id}.title`)}</p>
                    <p className="text-xs text-ink-soft mt-0.5">{t(`medals.items.${medal.id}.desc`)}</p>
                    {medal.earnedAt && (
                      <p className="text-[10px] text-brand mt-1 font-medium">
                        {tr('medals.earnedOn', { date: formatDateLong(medal.earnedAt, locale) })}
                      </p>
                    )}
                    <p className="text-xs text-brand mt-1.5 italic leading-relaxed">
                      {t(`medals.celebration.motivation.${medal.tier}`)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex gap-3 relative">
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
      </div>
    </>
  );

  return createPortal(modal, document.body);
}
