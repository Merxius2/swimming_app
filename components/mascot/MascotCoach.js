import { useEffect, useState } from 'react';
import MascotCharacter from './MascotCharacter';

/**
 * Animated swim-coach mascot with speech bubble.
 */
export default function MascotCoach({
  message = '',
  sex = 'male',
  level = 'intermediate',
  equipped = [],
  size = 140,
  animated = true,
  className = '',
  bubbleClassName = '',
}) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (!animated) return undefined;
    const scheduleBlink = () => {
      const delay = 2500 + Math.random() * 2000;
      return setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 140);
      }, delay);
    };
    let timer = scheduleBlink();
    const interval = setInterval(() => {
      clearTimeout(timer);
      timer = scheduleBlink();
    }, 4000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [animated]);

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {message && (
        <div className={`relative z-10 w-full max-w-sm ${bubbleClassName}`}>
          <div className="glass rounded-2xl px-4 py-3 text-sm font-medium text-ink dark:text-gray-100 shadow-md border border-white/40 dark:border-white/10 leading-relaxed mascot-speech-enter">
            {message}
          </div>
          <div
            className="w-4 h-4 bg-white/70 dark:bg-gray-800/80 rotate-45 mx-auto -mt-2 border-r border-b border-white/40 dark:border-white/10"
            aria-hidden="true"
          />
        </div>
      )}

      <div className={animated ? 'mascot-idle-bounce' : ''}>
        <MascotCharacter
          sex={sex}
          level={level}
          blink={blink}
          equipped={equipped}
          size={size}
        />
      </div>
    </div>
  );
}
