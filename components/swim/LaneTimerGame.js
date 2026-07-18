import { useCallback, useEffect, useRef, useState } from 'react';
import { Timer } from 'lucide-react';
import { useLanguage } from '../../context/UserPreferencesContext';
import { useSwim } from '../../context/SwimContext';
import CoinBadge from './CoinBadge';

const ENTRY_COST = 5;

function rewardForReaction(ms) {
  if (ms < 220) return 30;
  if (ms < 320) return 20;
  if (ms < 450) return 12;
  if (ms < 650) return 6;
  return 0;
}

export default function LaneTimerGame() {
  const { t } = useLanguage();
  const { totalCoins, adjustCoins } = useSwim();
  const [phase, setPhase] = useState('idle');
  const [message, setMessage] = useState('');
  const [reward, setReward] = useState(null);
  const startRef = useRef(null);
  const timeoutRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const reset = () => {
    clearTimer();
    setPhase('idle');
    setMessage('');
    setReward(null);
    startRef.current = null;
  };

  const startRound = () => {
    if ((totalCoins ?? 0) < ENTRY_COST || phase === 'waiting') return;
    adjustCoins(-ENTRY_COST);
    setReward(null);
    setMessage(t('miniGames.laneTimer.wait'));
    setPhase('waiting');

    const delay = 1200 + Math.random() * 2800;
    timeoutRef.current = window.setTimeout(() => {
      startRef.current = performance.now();
      setPhase('go');
      setMessage(t('miniGames.laneTimer.go'));
    }, delay);
  };

  const handleTap = () => {
    if (phase === 'waiting') {
      clearTimer();
      setPhase('idle');
      setMessage(t('miniGames.laneTimer.early'));
      return;
    }

    if (phase !== 'go' || !startRef.current) return;

    const reactionMs = Math.round(performance.now() - startRef.current);
    const payout = rewardForReaction(reactionMs);
    if (payout > 0) adjustCoins(payout);
    setReward(payout);
    setPhase('done');
    setMessage(t('miniGames.laneTimer.result').replace('{ms}', String(reactionMs)));
  };

  const laneClass = phase === 'go'
    ? 'bg-emerald-500 border-emerald-400'
    : phase === 'waiting'
      ? 'bg-amber-400 border-amber-300 animate-pulse'
      : 'bg-sky-500/80 border-sky-400';

  return (
    <section className="card p-6">
      <div className="flex items-center gap-2 mb-2">
        <Timer size={20} className="text-brand-primary" />
        <h2 className="text-lg font-bold text-ink">{t('miniGames.laneTimer.title')}</h2>
      </div>
      <p className="text-sm text-ink-soft mb-5">{t('miniGames.laneTimer.desc')}</p>

      <button
        type="button"
        onClick={handleTap}
        className={`w-full h-36 rounded-2xl border-4 transition-colors mb-4 flex items-center justify-center ${laneClass}`}
      >
        <span className="text-lg font-bold text-white drop-shadow">{message || t('miniGames.laneTimer.tap')}</span>
      </button>

      <div className="flex items-center justify-between gap-3">
        <CoinBadge amount={ENTRY_COST} size="sm" />
        {phase === 'idle' || phase === 'done' ? (
          <button
            type="button"
            disabled={(totalCoins ?? 0) < ENTRY_COST}
            onClick={phase === 'done' ? reset : startRound}
            className="wheel-spin-btn px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-45"
          >
            {phase === 'done' ? t('miniGames.laneTimer.again') : t('miniGames.laneTimer.start').replace('{cost}', String(ENTRY_COST))}
          </button>
        ) : (
          <span className="text-xs text-ink-faint">{t('miniGames.laneTimer.listening')}</span>
        )}
      </div>

      {phase === 'done' && (
        <p className={`mt-4 text-sm font-semibold ${reward > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-soft'}`}>
          {reward > 0
            ? t('miniGames.laneTimer.won').replace('{amount}', String(reward))
            : t('miniGames.laneTimer.noReward')}
        </p>
      )}
    </section>
  );
}
