import { Coins, Lightbulb, Sparkles, TrendingUp, Waves } from 'lucide-react';

const TONE_META = {
  default: { Icon: Waves, iconClass: 'text-brand-primary' },
  reward: { Icon: Coins, iconClass: 'text-amber-500' },
  tip: { Icon: Lightbulb, iconClass: 'text-teal-500' },
  levelUp: { Icon: TrendingUp, iconClass: 'text-emerald-500' },
  thinking: { Icon: Sparkles, iconClass: 'text-brand-primary animate-pulse' },
};

export default function MascotSpeechBubble({
  message = '',
  tone = 'default',
  className = '',
}) {
  if (!message) return null;

  const { Icon, iconClass } = TONE_META[tone] || TONE_META.default;

  return (
    <div className={`relative z-10 w-full max-w-sm ${className}`}>
      <div
        className={`mascot-speech-bubble mascot-speech-bubble--${tone} mascot-speech-enter flex gap-3 items-start`}
      >
        <span
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-white/80 dark:bg-gray-900/60 border border-white/60 dark:border-white/10 shadow-sm ${iconClass}`}
          aria-hidden="true"
        >
          <Icon size={18} strokeWidth={2.25} />
        </span>
        <p className="text-sm font-medium text-ink dark:text-gray-100 leading-relaxed pt-1.5 min-w-0">
          {message}
        </p>
      </div>
      <div className="mascot-speech-tail" aria-hidden="true" />
    </div>
  );
}
