import { ShoppingBag } from 'lucide-react';
import { useLanguage, useTheme } from '../../context/UserPreferencesContext';
import { useSwim } from '../../context/SwimContext';
import CoinBadge from './CoinBadge';
import {
  THEME_STORE_PRICE,
  STORED_THEME_CODES,
  canPurchaseTheme,
  isThemeUnlocked,
} from '../../lib/swimCoinStore';

function tf(t, key, params = {}) {
  let text = t(key);
  Object.entries(params).forEach(([name, value]) => {
    text = text.replace(`{${name}}`, String(value));
  });
  return text;
}

function ThemePreview({ item }) {
  return (
    <div
      className="h-20 w-full rounded-lg border border-black/[0.08] dark:border-white/10 overflow-hidden flex"
      style={
        item.previewStyle === 'flat'
          ? undefined
          : {
              background: `linear-gradient(135deg, ${item.preview.from} 0%, ${item.preview.via} 55%, ${item.preview.to} 100%)`,
            }
      }
    >
      {item.previewStyle === 'flat' && (
        <>
          <span className="flex-1" style={{ background: item.preview.from }} />
          <span className="flex-1" style={{ background: item.preview.via }} />
          {item.preview.quaternary && (
            <span className="flex-1" style={{ background: item.preview.quaternary }} />
          )}
          <span className="flex-1" style={{ background: item.preview.to }} />
        </>
      )}
    </div>
  );
}

export default function SwimCoinStore() {
  const { t } = useLanguage();
  const { theme, changeTheme, THEMES } = useTheme();
  const { totalCoins, purchasedThemes, purchaseTheme, isLoading } = useSwim();
  const storeThemes = THEMES.filter((item) => STORED_THEME_CODES.includes(item.code));

  const handlePurchase = (themeCode) => {
    if (!canPurchaseTheme(themeCode, purchasedThemes, totalCoins)) return;
    purchaseTheme(themeCode);
    changeTheme(themeCode);
  };

  return (
    <section className="coin-store mt-14 pt-10 border-t border-black/[0.06] dark:border-white/10">
      <div className="flex items-center justify-center gap-2 mb-2">
        <ShoppingBag size={20} className="text-brand-primary" strokeWidth={2.25} />
        <h2 className="text-xl font-bold text-ink dark:text-[#FAFAFA]">
          {t('coins.store.title')}
        </h2>
      </div>
      <p className="text-sm text-ink-soft text-center mb-8 max-w-md mx-auto">
        {t('coins.store.subtitle')}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {storeThemes.map((item) => {
          const owned = isThemeUnlocked(item.code, purchasedThemes);
          const canBuy = canPurchaseTheme(item.code, purchasedThemes, totalCoins);
          const shortfall = Math.max(0, THEME_STORE_PRICE - (totalCoins ?? 0));

          return (
            <article
              key={item.code}
              className="coin-store-item card p-5 flex flex-col gap-4"
            >
              <ThemePreview item={item} />
              <div>
                <h3 className="text-base font-semibold text-ink dark:text-[#FAFAFA]">
                  {t(item.nameKey)}
                </h3>
                <p className="mt-1 text-xs text-ink-soft">{t(item.descKey)}</p>
              </div>
              <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                {owned ? (
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {t('coins.store.owned')}
                  </span>
                ) : (
                  <CoinBadge amount={THEME_STORE_PRICE} size="sm" />
                )}
                {!owned && (
                  <button
                    type="button"
                    disabled={isLoading || !canBuy}
                    onClick={() => handlePurchase(item.code)}
                    className="wheel-spin-btn text-sm px-4 py-2 rounded-lg disabled:opacity-45 disabled:cursor-not-allowed"
                  >
                    {canBuy
                      ? t('coins.store.buy')
                      : tf(t, 'coins.store.notEnough', { amount: shortfall.toLocaleString() })}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
