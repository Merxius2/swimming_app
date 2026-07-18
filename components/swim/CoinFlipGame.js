import { useMemo, useState } from 'react';
import { Coins } from 'lucide-react';
import { useLanguage } from '../../context/UserPreferencesContext';
import { useSwim } from '../../context/SwimContext';
import CoinBadge from './CoinBadge';

const BETS = [5, 25, 50];
const WIN_CHANCE = 0.47;

function tf(t, key, params = {}) {
  let text = t(key);
  Object.entries(params).forEach(([name, value]) => {
    text = text.replace(`{${name}}`, String(value));
  });
  return text;
}

export default function CoinFlipGame() {
  const { t } = useLanguage();
  const { totalCoins, adjustCoins } = useSwim();
  const [bet, setBet] = useState(BETS[0]);
  const [choice, setChoice] = useState('heads');
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState(null);

  const canPlay = (totalCoins ?? 0) >= bet && !flipping;

  const handleFlip = () => {
    if (!canPlay) return;
    setFlipping(true);
    setResult(null);
    adjustCoins(-bet);

    window.setTimeout(() => {
      const landed = Math.random() < 0.5 ? 'heads' : 'tails';
      const won = landed === choice && Math.random() < WIN_CHANCE;
      if (won) adjustCoins(bet * 2);
      setResult({ landed, won, payout: won ? bet * 2 : 0 });
      setFlipping(false);
    }, 900);
  };

  const resultMessage = useMemo(() => {
    if (!result) return null;
    if (result.won) return tf(t, 'miniGames.coinFlip.won', { amount: result.payout });
    return t('miniGames.coinFlip.lost');
  }, [result, t]);

  return (
    <section className="card p-6">
      <div className="flex items-center gap-2 mb-2">
        <Coins size={20} className="text-brand-primary" />
        <h2 className="text-lg font-bold text-ink">{t('miniGames.coinFlip.title')}</h2>
      </div>
      <p className="text-sm text-ink-soft mb-5">{t('miniGames.coinFlip.desc')}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {BETS.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => setBet(amount)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              bet === amount
                ? 'bg-brand-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-ink-soft'
            }`}
          >
            {amount}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {['heads', 'tails'].map((side) => (
          <button
            key={side}
            type="button"
            onClick={() => setChoice(side)}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
              choice === side
                ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                : 'border-black/[0.08] dark:border-white/10 text-ink-soft'
            }`}
          >
            {t(`miniGames.coinFlip.${side}`)}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <CoinBadge amount={bet} size="sm" />
        <button
          type="button"
          disabled={!canPlay}
          onClick={handleFlip}
          className="wheel-spin-btn px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-45"
        >
          {flipping ? t('miniGames.coinFlip.flipping') : t('miniGames.coinFlip.play')}
        </button>
      </div>

      {resultMessage && (
        <p className={`mt-4 text-sm font-semibold ${result?.won ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-soft'}`}>
          {resultMessage}
        </p>
      )}
    </section>
  );
}
