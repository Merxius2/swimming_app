/**
 * Home / Landing — Aap-SC Swim Coach
 */

import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Upload, BarChart3, TrendingUp, History } from 'lucide-react';

import { useLanguage, useDarkMode } from '../context/UserPreferencesContext';
import { LANGUAGES, LANGUAGE_FAVICON_MAP } from '../lib/appConstants';
import ToolTile from '../components/ToolTile';

const LANG_ICON = {
  en: LANGUAGE_FAVICON_MAP.en.replace('-192', '-512'),
  nl: LANGUAGE_FAVICON_MAP.nl.replace('-192', '-512'),
  ru: LANGUAGE_FAVICON_MAP.ru.replace('-192', '-512'),
  tr: LANGUAGE_FAVICON_MAP.tr.replace('-192', '-512'),
  mu: LANGUAGE_FAVICON_MAP.mu.replace('-192', '-512'),
};

export default function Home() {
  const { t, language, changeLanguage, isLoading } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const close = () => setLangOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  if (isLoading) return <div className="min-h-screen" />;

  const iconPath = LANG_ICON[language] || LANG_ICON.en;
  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <>
      <Head>
        <title>Aap-SC — Swim Coach</title>
      </Head>

      <div className="min-h-screen px-4 sm:px-6">
        <header className="sticky top-3 sm:top-4 z-30 pointer-events-none flex justify-center">
          <div className="pointer-events-auto glass-thick rounded-full px-2 h-12 flex items-center gap-1.5">
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setLangOpen((v) => !v)}
                className="flex items-center gap-1.5 h-9 px-3 rounded-full text-[13px] font-medium text-ink-soft hover:bg-black/5 transition"
              >
                <span className="text-[16px] leading-none">{currentLang.flag}</span>
                <span>{currentLang.shortCode || currentLang.code.toUpperCase()}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-40 glass-thick rounded-md overflow-hidden p-1">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => { changeLanguage(l.code); setLangOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] rounded-sm text-left hover:bg-black/5 ${
                        language === l.code ? 'font-semibold' : ''
                      }`}
                    >
                      <span className="text-[15px]">{l.flag}</span>
                      <span>{l.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={toggleDarkMode}
              className="h-9 w-9 inline-flex items-center justify-center rounded-full text-ink-soft hover:bg-black/5 transition"
              title={isDarkMode ? t('landing.lightMode') : t('landing.darkMode')}
              aria-label="Toggle theme"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        <section className="pt-12 sm:pt-16 pb-10 text-center">
          <div className="inline-flex rounded-full overflow-hidden mb-6 shadow-soft-md">
            <Image src={iconPath} alt="Aap-SC" width={112} height={112} priority />
          </div>
          <h1 className="display text-[44px] sm:text-[56px] leading-[0.95] tracking-[-0.03em]">
            {t('landing.title')}
          </h1>
          <p className="text-[13px] uppercase tracking-[0.2em] text-ink-faint mt-1">
            {t('landing.subtitle')}
          </p>
          <p className="text-[15px] text-ink-soft mt-3 max-w-sm mx-auto leading-relaxed">
            {t('landing.description')}
          </p>

          <div className="mt-7 flex justify-center">
            <Link href="/progress">
              <button
                type="button"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full text-white text-[14px] font-semibold shadow-pill-tint"
                style={{ background: 'linear-gradient(135deg,#3B5BFF 0%, #7B5BFF 100%)' }}
              >
                {t('landing.cta')}
                <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </section>

        <section className="pb-32">
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink-faint px-1 mb-3">
            Swim Coach
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <ToolTile href="/upload" icon={Upload} titleKey="landing.uploadLabel" idx="01" tint="mint" />
            <ToolTile href="/progress" icon={BarChart3} titleKey="landing.progressLabel" idx="02" tint="violet" />
            <ToolTile href="/benchmark" icon={TrendingUp} titleKey="landing.benchmarkLabel" idx="03" tint="amber" />
            <ToolTile href="/history" icon={History} titleKey="landing.historyLabel" idx="04" tint="coral" />
          </div>
        </section>
      </div>
    </>
  );
}
