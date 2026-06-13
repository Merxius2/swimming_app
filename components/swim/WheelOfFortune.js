import { useCallback, useMemo, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/UserPreferencesContext';
import { useSwim } from '../../context/SwimContext';
import CoinBadge from './CoinBadge';
import {
  WHEEL_BETS,
  buildWheelLayout,
  pickRandomSegmentIndex,
  getSpinRotation,
  resolveWheelOutcome,
  canAffordSpin,
  segmentPathFromLayout,
  segmentLabelArcPath,
  segmentTextPositionFromLayout,
  segmentLabelKey,
  segmentLabelParams,
  segmentShowsLabel,
  segmentUsesRadialLabel,
  segmentShouldShowLabel,
} from '../../lib/swimWheel';

const SPIN_MS = 4200;

function tf(t, key, params = {}) {
  let text = t(key);
  Object.entries(params).forEach(([name, value]) => {
    text = text.replace(`{${name}}`, String(value));
  });
  return text;
}

function segmentDisplayLabel(segment, bet, t) {
  const labelKey = segmentLabelKey(segment);
  if (segment.type === 'coins' || (segment.type === 'free_spin' && segment.multiplier > 1)) {
    return tf(t, labelKey, segmentLabelParams(segment, bet));
  }
  return t(labelKey);
}

function WheelDisc({ rotation, spinning, bet, layout, t, onSpinEnd }) {
  return (
    <div
      className="wheel-disc"
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)` : 'none',
      }}
      onTransitionEnd={(e) => {
        if (e.propertyName === 'transform' && spinning) onSpinEnd();
      }}
    >
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg" aria-hidden="true">
        <defs>
          <linearGradient id="wheelGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF4B8" />
            <stop offset="40%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
          <linearGradient id="wheelGoldShine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <radialGradient id="wheelHub" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#F59E0B" />
          </radialGradient>
          {layout.segments
            .filter((segment) => segmentShouldShowLabel(segment) && !segmentUsesRadialLabel(segment))
            .map((segment) => (
            <path
              key={`arc-${segment.id}`}
              id={`wheel-label-arc-${segment.id}`}
              d={segmentLabelArcPath(segment)}
              fill="none"
            />
          ))}
        </defs>
        <circle cx="100" cy="100" r="98" fill="#18181B" />
        {layout.segments.map((segment) => {
          const pathD = segmentPathFromLayout(segment);
          const showLabel = segmentShouldShowLabel(segment);
          const useRadial = segmentUsesRadialLabel(segment);
          const shortLabel = showLabel ? segmentDisplayLabel(segment, bet, t) : null;
          const isGold = segment.shiny;
          const radial = useRadial ? segmentTextPositionFromLayout(segment) : null;
          const fontSize = radial?.fontSize ?? segmentTextPositionFromLayout(segment).fontSize;

          return (
            <g key={segment.id}>
              <path
                d={pathD}
                fill={isGold ? 'url(#wheelGoldGrad)' : segment.color}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
                className={isGold ? 'wheel-segment-gold' : undefined}
              />
              {isGold && (
                <path
                  d={pathD}
                  fill="url(#wheelGoldShine)"
                  className="wheel-segment-gold-shine"
                  stroke="none"
                />
              )}
              {showLabel && shortLabel && useRadial && radial && (
                <text
                  x={radial.x}
                  y={radial.y}
                  fill={isGold ? '#78350F' : '#fff'}
                  fontSize={fontSize}
                  fontWeight="700"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${radial.rotate}, ${radial.x}, ${radial.y})`}
                  style={{ textShadow: isGold ? '0 0 6px rgba(255,255,255,0.8)' : '0 1px 2px rgba(0,0,0,0.45)' }}
                >
                  {shortLabel}
                </text>
              )}
              {showLabel && shortLabel && !useRadial && (
                <text
                  fill={isGold ? '#78350F' : '#fff'}
                  fontSize={fontSize}
                  fontWeight="700"
                  style={{ textShadow: isGold ? '0 0 6px rgba(255,255,255,0.8)' : '0 1px 2px rgba(0,0,0,0.45)' }}
                >
                  <textPath
                    href={`#wheel-label-arc-${segment.id}`}
                    startOffset="50%"
                    textAnchor="middle"
                  >
                    {shortLabel}
                  </textPath>
                </text>
              )}
            </g>
          );
        })}
        <circle cx="100" cy="100" r="18" fill="#FAFAFA" stroke="#E4E4E7" strokeWidth="2" />
        <circle cx="100" cy="100" r="10" fill="url(#wheelHub)" />
      </svg>
    </div>
  );
}

export default function WheelOfFortune() {
  const { t } = useLanguage();
  const { totalCoins, adjustCoins } = useSwim();
  const [bet, setBet] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [freeSpins, setFreeSpins] = useState(0);
  const [result, setResult] = useState(null);
  const pendingOutcomeRef = useRef(null);
  const spinLayoutRef = useRef(null);

  const layout = useMemo(() => buildWheelLayout(bet), [bet]);
  const displayLayout = spinning && spinLayoutRef.current ? spinLayoutRef.current : layout;
  const affordable = canAffordSpin(totalCoins, bet, freeSpins);

  const handleSpinEnd = useCallback(() => {
    if (!pendingOutcomeRef.current) return;

    const { segment, usedFreeSpin } = pendingOutcomeRef.current;
    pendingOutcomeRef.current = null;
    spinLayoutRef.current = null;
    const resolved = resolveWheelOutcome(segment, bet, { usedFreeSpin });

    if (resolved.coinsDelta > 0) {
      adjustCoins(resolved.coinsDelta);
    }
    if (resolved.freeSpinsGranted) {
      setFreeSpins((count) => count + resolved.freeSpinsGranted);
    }

    setResult({ segment, resolved });
    setSpinning(false);
  }, [adjustCoins, bet]);

  const spin = () => {
    if (spinning || !affordable) return;

    const spinLayout = buildWheelLayout(bet);
    spinLayoutRef.current = spinLayout;

    const usedFreeSpin = freeSpins > 0;
    if (usedFreeSpin) {
      setFreeSpins((count) => count - 1);
    } else {
      adjustCoins(-bet);
    }

    const segmentIndex = pickRandomSegmentIndex(spinLayout);
    const segment = spinLayout.segments[segmentIndex];
    const nextRotation = getSpinRotation(segmentIndex, spinLayout, rotation);

    pendingOutcomeRef.current = { segment, usedFreeSpin };
    setResult(null);
    setSpinning(true);
    setRotation(nextRotation);
  };

  return (
    <div className="wheel-of-fortune max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <CoinBadge amount={totalCoins} />
        {freeSpins > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7B5BFF] dark:text-[#C8D2FF] bg-[#7B5BFF]/10 px-2.5 py-1 rounded-full">
            <Sparkles size={13} />
            {tf(t, 'coins.wheel.freeSpinReady', { count: freeSpins })}
          </span>
        )}
      </div>

      <div className="wheel-stage relative mx-auto mb-8" aria-live="polite">
        <div className="wheel-pointer" aria-hidden="true" />
        <WheelDisc
          rotation={rotation}
          spinning={spinning}
          bet={bet}
          layout={displayLayout}
          t={t}
          onSpinEnd={handleSpinEnd}
        />
      </div>

      <p className="text-sm text-ink-soft text-center mb-4">{t('coins.wheel.pickBet')}</p>
      <div className="flex justify-center gap-2 mb-6">
        {WHEEL_BETS.map((amount) => {
          const active = bet === amount;
          const disabled = spinning || (!freeSpins && totalCoins < amount);
          return (
            <button
              key={amount}
              type="button"
              disabled={disabled}
              onClick={() => setBet(amount)}
              className={[
                'wheel-bet-btn px-4 py-2.5 rounded-lg text-sm font-semibold tabular-nums transition-all',
                active
                  ? 'wheel-bet-btn-active'
                  : 'bg-black/[0.04] text-ink-soft hover:bg-black/[0.07] dark:bg-white/[0.06] dark:text-[#A1A1AA] dark:hover:bg-white/[0.1]',
                disabled && !active ? 'opacity-40 cursor-not-allowed' : '',
              ].join(' ')}
            >
              {amount}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={spin}
        disabled={spinning || !affordable}
        className="wheel-spin-btn w-full py-3.5 rounded-xl text-[15px] font-semibold text-white disabled:opacity-45 disabled:cursor-not-allowed"
      >
        {spinning
          ? t('coins.wheel.spinning')
          : freeSpins > 0
            ? tf(t, 'coins.wheel.spinFree', { count: freeSpins })
            : tf(t, 'coins.wheel.spin', { bet })}
      </button>

      {!affordable && !spinning && (
        <p className="text-xs text-center text-ink-faint mt-3">{t('coins.wheel.notEnough')}</p>
      )}

      {result && (
        <div className="wheel-result card mt-6 p-4 text-center" role="status">
          <p className="text-sm font-semibold text-ink dark:text-[#FAFAFA] mb-1">
            {t('coins.wheel.resultTitle')}
          </p>
          <p className="text-[15px] text-ink-soft">
            {result.resolved.type === 'coins' && tf(t, 'coins.wheel.wonCoins', {
              amount: result.resolved.coinsDelta,
            })}
            {result.resolved.type === 'free_spin' && (
              result.resolved.freeSpinsGranted > 1
                ? tf(t, 'coins.wheel.wonFreeSpinMulti', { count: result.resolved.freeSpinsGranted })
                : t('coins.wheel.wonFreeSpin')
            )}
            {result.resolved.type === 'nothing' && tf(t, 'coins.wheel.wonNothing', {
              amount: result.resolved.amountLost ?? bet,
            })}
          </p>
        </div>
      )}
    </div>
  );
}
