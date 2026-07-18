import { useCallback, useMemo, useState } from 'react';
import { Target } from 'lucide-react';
import { useLanguage } from '../../context/UserPreferencesContext';
import { useSwim } from '../../context/SwimContext';
import CoinBadge from './CoinBadge';
import { formatDateShort, formatDistance, formatPace } from '../../lib/swimFormatters';

function buildRound(sessions) {
  const eligible = sessions.filter((session) => session.metrics?.paceSecPer100m != null);
  if (eligible.length < 2) return null;

  const shuffled = [...eligible].sort(() => Math.random() - 0.5);
  const left = shuffled[0];
  const right = shuffled[1];
  const fasterId = left.metrics.paceSecPer100m <= right.metrics.paceSecPer100m ? left.id : right.id;

  return { left, right, fasterId };
}

export default function PacePickGame() {
  const { t } = useLanguage();
  const { sessions, adjustCoins } = useSwim();
  const [round, setRound] = useState(() => buildRound(sessions));
  const [pickedId, setPickedId] = useState(null);
  const [streak, setStreak] = useState(0);
  const [lastReward, setLastReward] = useState(null);

  const hasEnoughSessions = sessions.length >= 2;

  const nextRound = useCallback(() => {
    setRound(buildRound(sessions));
    setPickedId(null);
    setLastReward(null);
  }, [sessions]);

  const handlePick = (sessionId) => {
    if (!round || pickedId) return;
    setPickedId(sessionId);
    const correct = sessionId === round.fasterId;
    const reward = correct ? Math.min(25, 8 + streak * 3) : 0;
    if (reward > 0) adjustCoins(reward);
    setLastReward(reward);
    setStreak(correct ? streak + 1 : 0);
  };

  const sessionCards = useMemo(() => {
    if (!round) return [];
    return [round.left, round.right].map((session) => ({
      session,
      label: formatDateShort(session.date),
      distance: formatDistance(session.metrics?.distanceM),
      pace: formatPace(session.metrics?.paceSecPer100m),
    }));
  }, [round]);

  if (!hasEnoughSessions) {
    return (
      <section className="card p-6">
        <div className="flex items-center gap-2 mb-2">
          <Target size={20} className="text-brand-primary" />
          <h2 className="text-lg font-bold text-ink">{t('miniGames.pacePick.title')}</h2>
        </div>
        <p className="text-sm text-ink-soft">{t('miniGames.pacePick.needSessions')}</p>
      </section>
    );
  }

  return (
    <section className="card p-6">
      <div className="flex items-center gap-2 mb-2">
        <Target size={20} className="text-brand-primary" />
        <h2 className="text-lg font-bold text-ink">{t('miniGames.pacePick.title')}</h2>
      </div>
      <p className="text-sm text-ink-soft mb-5">{t('miniGames.pacePick.desc')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {sessionCards.map(({ session, label, distance, pace }) => {
          const isPicked = pickedId === session.id;
          const isWinner = pickedId && session.id === round.fasterId;
          const isLoser = pickedId && isPicked && session.id !== round.fasterId;

          return (
            <button
              key={session.id}
              type="button"
              disabled={Boolean(pickedId)}
              onClick={() => handlePick(session.id)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                isWinner
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : isLoser
                    ? 'border-red-400 bg-red-400/10'
                    : 'border-black/[0.08] dark:border-white/10 hover:border-brand-primary/40'
              }`}
            >
              <p className="text-xs uppercase tracking-wider text-ink-faint mb-2">{label}</p>
              <p className="text-sm text-ink-soft">{distance}</p>
              <p className="text-xl font-bold text-teal-500 mt-1">{pace}</p>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-ink-soft">
          {t('miniGames.pacePick.streak').replace('{count}', String(streak))}
        </p>
        {pickedId ? (
          <div className="flex items-center gap-3">
            {lastReward > 0 && <CoinBadge amount={lastReward} size="sm" />}
            <button type="button" onClick={nextRound} className="wheel-spin-btn px-4 py-2 rounded-lg text-sm font-semibold">
              {t('miniGames.pacePick.next')}
            </button>
          </div>
        ) : (
          <span className="text-xs text-ink-faint">{t('miniGames.pacePick.free')}</span>
        )}
      </div>
    </section>
  );
}
