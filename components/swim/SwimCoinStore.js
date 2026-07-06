import { useEffect } from 'react';
import {
  ShoppingBag, Sparkles, Palette, Zap, Award, Coins, PartyPopper, AppWindow, Shuffle, Smile,
} from 'lucide-react';
import { useLanguage, useTheme } from '../../context/UserPreferencesContext';
import { useSwim } from '../../context/SwimContext';
import CoinBadge from './CoinBadge';
import { getAppIconPreset } from '../../lib/storeAppIcons';
import {
  STORE_CATEGORIES,
  getStoreItemsByCategory,
  canPurchaseStoreItem,
  isStoreItemOwned,
  isThemeUnlocked,
  getDailyPaidSpinLimit,
  isConsumableStoreItem,
  CHALLENGE_REROLL_STORE_ITEM_ID,
  BONUS_WHEEL_SPIN_STORE_ITEM_ID,
} from '../../lib/swimCoinStore';
import { equipMascotItem, getMascotPreviewSex, resolveMascotSex } from '../../lib/mascotConstants';
import MascotCharacter from '../mascot/MascotCharacter';

const CATEGORY_META = {
  themes: { icon: Palette, labelKey: 'coins.store.categories.themes' },
  icons: { icon: AppWindow, labelKey: 'coins.store.categories.icons' },
  vibes: { icon: Sparkles, labelKey: 'coins.store.categories.vibes' },
  flair: { icon: PartyPopper, labelKey: 'coins.store.categories.flair' },
  boosts: { icon: Zap, labelKey: 'coins.store.categories.boosts' },
  titles: { icon: Award, labelKey: 'coins.store.categories.titles' },
  mascot: { icon: Smile, labelKey: 'coins.store.categories.mascot' },
};

function tf(t, key, params = {}) {
  let text = t(key);
  Object.entries(params).forEach(([name, value]) => {
    text = text.replace(`{${name}}`, String(value));
  });
  return text;
}

function storeItemDomId(itemId) {
  return `store-item-${itemId.replace(/:/g, '-')}`;
}

function ThemePreview({ item, THEMES }) {
  const theme = THEMES.find((entry) => entry.code === item.themeCode);
  if (!theme) return null;

  return (
    <div
      className="h-20 w-full rounded-lg border border-black/[0.08] dark:border-white/10 overflow-hidden flex"
      style={
        theme.previewStyle === 'flat'
          ? undefined
          : {
              background: `linear-gradient(135deg, ${theme.preview.from} 0%, ${theme.preview.via} 55%, ${theme.preview.to} 100%)`,
            }
      }
    >
      {theme.previewStyle === 'flat' && (
        <>
          <span className="flex-1" style={{ background: theme.preview.from }} />
          <span className="flex-1" style={{ background: theme.preview.via }} />
          {theme.preview.quaternary && (
            <span className="flex-1" style={{ background: theme.preview.quaternary }} />
          )}
          <span className="flex-1" style={{ background: theme.preview.to }} />
        </>
      )}
    </div>
  );
}

function StoreItemPreview({ item, t, THEMES, bonusWheelSpinCredits, mascotSex }) {
  switch (item.preview) {
    case 'theme':
      return <ThemePreview item={item} THEMES={THEMES} />;
    case 'ambient-neon':
      return (
        <div
          className="store-preview-ambient store-preview-animated-neon h-20 rounded-lg overflow-hidden"
          style={{ background: 'linear-gradient(-45deg, #020617, #0c1445, #1a0533, #7c3aed, #00e5ff, #ff00aa)' }}
        />
      );
    case 'ambient-sunset':
      return (
        <div
          className="store-preview-ambient store-preview-animated-sunset h-20 rounded-lg overflow-hidden"
          style={{ background: 'linear-gradient(-45deg, #431407, #9a3412, #fb923c, #f472b6, #fbbf24, #7c2d12)' }}
        />
      );
    case 'ambient-bubbles':
      return (
        <div className="store-preview-bubbles h-20 rounded-lg relative overflow-hidden bg-gradient-to-br from-sky-400 to-cyan-700">
          <span className="store-bubble store-bubble-a" />
          <span className="store-bubble store-bubble-b" />
          <span className="store-bubble store-bubble-c" />
        </div>
      );
    case 'ambient-aurora':
      return (
        <div
          className="store-preview-ambient store-preview-animated-aurora h-20 rounded-lg overflow-hidden"
          style={{ background: 'linear-gradient(-45deg, #042f2e, #134e4a, #312e81, #4338ca, #0e7490)' }}
        />
      );
    case 'ambient-deep':
      return (
        <div
          className="store-preview-ambient store-preview-animated-deep h-20 rounded-lg overflow-hidden"
          style={{ background: 'linear-gradient(-45deg, #020617, #0c4a6e, #0369a1, #164e63, #0ea5e9)' }}
        />
      );
    case 'golden-coins':
      return (
        <div className="h-20 rounded-lg flex items-center justify-center bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-950/40 dark:to-yellow-950/30 border border-amber-200/60 dark:border-amber-700/40">
          <CoinBadge amount={1337} size="sm" golden />
        </div>
      );
    case 'confetti':
      return (
        <div className="h-20 rounded-lg flex items-center justify-center gap-1 bg-gradient-to-br from-violet-100 to-pink-100 dark:from-violet-950/50 dark:to-pink-950/40 overflow-hidden relative">
          <span className="text-2xl animate-bounce" style={{ animationDelay: '0ms' }}>🎊</span>
          <span className="text-xl animate-bounce" style={{ animationDelay: '120ms' }}>✨</span>
          <span className="text-2xl animate-bounce" style={{ animationDelay: '240ms' }}>🎉</span>
        </div>
      );
    case 'medal-shimmer':
      return (
        <div className="h-20 rounded-lg flex items-center justify-center bg-gradient-to-br from-amber-100/80 to-orange-100/60 dark:from-amber-950/40 dark:to-orange-950/30 medal-shimmer-plus-preview">
          <Award size={36} className="text-amber-500" strokeWidth={1.75} />
        </div>
      );
    case 'bonus-spin':
      return (
        <div className="h-20 rounded-lg flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-brand-primary/10 to-brand-secondary/15 border border-brand-primary/20">
          <span className="text-2xl font-black text-brand-primary tabular-nums">
            {getDailyPaidSpinLimit(bonusWheelSpinCredits)}/day
          </span>
          <span className="text-[10px] uppercase tracking-wider text-ink-soft font-semibold">
            {t('coins.store.items.bonusSpin.preview')}
          </span>
        </div>
      );
    case 'challenge-reroll':
      return (
        <div className="h-20 rounded-lg flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand-primary/10 to-[#7B5BFF]/15 border border-brand-primary/20 px-4">
          <Shuffle size={28} className="text-brand-primary" strokeWidth={2} />
          <span className="text-[10px] uppercase tracking-wider text-ink-soft font-semibold text-center">
            {t('coins.store.items.challengeReroll.preview')}
          </span>
        </div>
      );
    case 'title-lane-seven':
    case 'title-pool-shark':
    case 'title-splash-zone':
      return (
        <div className="h-20 rounded-lg flex items-center justify-center px-4 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-950 dark:to-slate-800">
          <span className="text-sm font-bold text-white tracking-wide text-center leading-tight">
            {t(item.nameKey)}
          </span>
        </div>
      );
    case 'icon-gold-medal':
    case 'icon-neon-lane':
    case 'icon-trophy-splash':
    case 'icon-platinum-star': {
      const preset = getAppIconPreset(item.id);
      if (!preset) return null;
      return (
        <div
          className="h-20 rounded-lg flex items-center justify-center overflow-hidden border border-black/[0.08] dark:border-white/10"
          style={{ background: preset.preview }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preset.ui} alt="" className="w-14 h-14 rounded-full shadow-md" />
        </div>
      );
    }
    case 'mascot-neon-cap':
    case 'mascot-gold-goggles':
    case 'mascot-medal-chain':
    case 'mascot-party-hat':
    case 'mascot-snorkel':
    case 'mascot-champion-cape':
    case 'mascot-suit-classic':
    case 'mascot-suit-racing':
    case 'mascot-suit-tropical':
    case 'mascot-shorts-classic':
    case 'mascot-shorts-jammer':
    case 'mascot-shorts-sunset': {
      const previewSex = getMascotPreviewSex(item.id, mascotSex);
      return (
        <div className="h-20 rounded-lg flex items-center justify-center bg-gradient-to-br from-tint/10 to-brand-accent/10 border border-brand-primary/15">
          <MascotCharacter sex={previewSex} level="intermediate" equipped={[item.id]} size={72} />
        </div>
      );
    }
    default:
      return (
        <div className="h-20 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <Coins size={28} className="text-amber-500" />
        </div>
      );
  }
}

export default function SwimCoinStore() {
  const { t } = useLanguage();
  const { changeTheme, THEMES } = useTheme();
  const { totalCoins, storeUnlocks, purchaseStoreItem, updateProfile, profile, isLoading, cheats, challengeRerollCredits, bonusWheelSpinCredits } = useSwim();
  const allThemesUnlocked = Boolean(cheats?.allThemesUnlocked);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.location.hash) return;
    const target = document.querySelector(window.location.hash);
    if (!target) return;
    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, []);

  const handlePurchase = (item) => {
    if (!canPurchaseStoreItem(item.id, storeUnlocks, totalCoins)) return;
    if (!purchaseStoreItem(item.id)) return;

    if (item.themeCode) changeTheme(item.themeCode);
    if (item.id.startsWith('ambient:')) updateProfile({ activeAmbient: item.id });
    if (item.id.startsWith('title:')) updateProfile({ swimmerTitle: item.id });
    if (item.id.startsWith('icon:')) updateProfile({ activeAppIcon: item.id });
    if (item.id.startsWith('mascot:')) {
      const mascotSex = resolveMascotSex(profile);
      updateProfile({
        mascotEquipped: equipMascotItem(
          profile.mascotEquipped || [],
          item.id,
          [...storeUnlocks, item.id],
          mascotSex
        ),
      });
    }
  };

  const mascotSex = resolveMascotSex(profile);

  return (
    <section className="coin-store mt-14 pt-10 border-t border-black/[0.06] dark:border-white/10">
      <div className="flex items-center justify-center gap-2 mb-2">
        <ShoppingBag size={20} className="text-brand-primary" strokeWidth={2.25} />
        <h2 className="text-xl font-bold text-ink dark:text-[#FAFAFA]">
          {t('coins.store.title')}
        </h2>
      </div>
      <p className="text-sm text-ink-soft text-center mb-10 max-w-lg mx-auto">
        {t('coins.store.subtitle')}
      </p>

      <div className="max-w-3xl mx-auto space-y-10">
        {STORE_CATEGORIES.map((category) => {
          const items = getStoreItemsByCategory(category);
          const meta = CATEGORY_META[category];
          const Icon = meta.icon;

          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-4 px-1">
                <Icon size={17} className="text-brand-primary" strokeWidth={2.25} />
                <h3 className="text-sm font-bold uppercase tracking-wider text-ink-soft">
                  {t(meta.labelKey)}
                </h3>
              </div>
              {category === 'vibes' && (
                <p className="text-xs text-ink-soft mb-4 px-1 leading-relaxed">
                  {t('coins.store.vibesIosNote')}
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((item) => {
                  const isConsumable = isConsumableStoreItem(item.id);
                  const owned = !isConsumable && (item.themeCode
                    ? isThemeUnlocked(item.themeCode, storeUnlocks, allThemesUnlocked)
                    : isStoreItemOwned(item.id, storeUnlocks));
                  const canBuy = isConsumable
                    ? (totalCoins ?? 0) >= item.price
                    : canPurchaseStoreItem(item.id, storeUnlocks, totalCoins);
                  const shortfall = Math.max(0, item.price - (totalCoins ?? 0));
                  const ownedCount = item.id === CHALLENGE_REROLL_STORE_ITEM_ID
                    ? challengeRerollCredits
                    : item.id === BONUS_WHEEL_SPIN_STORE_ITEM_ID
                      ? bonusWheelSpinCredits
                      : 0;

                  return (
                    <article
                      key={item.id}
                      id={storeItemDomId(item.id)}
                      data-store-item-id={item.id}
                      className="coin-store-item card p-5 flex flex-col gap-4 scroll-mt-28"
                    >
                      <StoreItemPreview
                        item={item}
                        t={t}
                        THEMES={THEMES}
                        bonusWheelSpinCredits={bonusWheelSpinCredits}
                        mascotSex={mascotSex}
                      />
                      <div>
                        <h4 className="text-base font-semibold text-ink dark:text-[#FAFAFA]">
                          {t(item.nameKey)}
                        </h4>
                        {item.mascotSex && (
                          <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-tint-soft text-[#2A45CC] dark:bg-tint/15">
                            {item.mascotSex === 'female'
                              ? t('coins.store.forFlo')
                              : t('coins.store.forFlip')}
                          </span>
                        )}
                        <p className="mt-1 text-xs text-ink-soft leading-relaxed">
                          {t(item.descKey)}
                        </p>
                        {isConsumable && ownedCount > 0 && (
                          <p className="mt-2 text-[11px] font-medium text-brand">
                            {item.id === BONUS_WHEEL_SPIN_STORE_ITEM_ID
                              ? tf(t, 'coins.store.bonusSpinOwned', { count: ownedCount })
                              : t('coins.store.ownedCount').replace('{count}', String(ownedCount))}
                          </p>
                        )}
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                        {owned ? (
                          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            {t('coins.store.owned')}
                          </span>
                        ) : (
                          <CoinBadge amount={item.price} size="sm" />
                        )}
                        {!owned && (
                          <button
                            type="button"
                            disabled={isLoading || !canBuy}
                            onClick={() => handlePurchase(item)}
                            className="wheel-spin-btn text-sm px-4 py-2 rounded-lg disabled:opacity-45 disabled:cursor-not-allowed shrink-0"
                          >
                            {canBuy
                              ? (isConsumable ? t('coins.store.buyConsumable') : t('coins.store.buy'))
                              : tf(t, 'coins.store.notEnough', { amount: shortfall.toLocaleString() })}
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
