import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Sparkles, ShoppingBag, MessageCircle, Settings, Waves } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import MascotSvg from '../components/mascot/MascotSvg';

const LEVELS = ['beginner', 'intermediate', 'advanced'];
const SEXES = ['male', 'female'];

const SHOP_ITEMS = [
  { id: 'cap-neon', emoji: '🧢', name: 'Neon Cap', price: 150, slot: 'head' },
  { id: 'goggles-gold', emoji: '🥽', name: 'Gold Goggles', price: 200, slot: 'face' },
  { id: 'medal-chain', emoji: '🏅', name: 'Medal Chain', price: 300, slot: 'neck' },
  { id: 'party-hat', emoji: '🎉', name: 'Party Hat', price: 175, slot: 'head' },
  { id: 'snorkel', emoji: '🤿', name: 'Snorkel Set', price: 225, slot: 'face' },
  { id: 'cape', emoji: '🦸', name: 'Champion Cape', price: 400, slot: 'back' },
];

const SPEECH_SAMPLES = [
  'Great pace today! Keep pushing!',
  'You earned 12 coins — nice swim!',
  'Try holding your rhythm on the next 500m.',
  'You leveled up to Intermediate! 🎉',
  'Upload a screenshot to track your progress.',
];

const LEVEL_LABELS = {
  beginner: { label: 'Beginner', color: '#F59E0B', desc: 'Floaties, nervous grin, learning the basics' },
  intermediate: { label: 'Intermediate', color: '#3B82F6', desc: 'Proper goggles, determined coach energy' },
  advanced: { label: 'Advanced', color: '#10B981', desc: 'Gold medal, champion cape, glowing aura' },
};

export default function MascotMockupPage() {
  const [sex, setSex] = useState('male');
  const [level, setLevel] = useState('intermediate');
  const [blink, setBlink] = useState(false);
  const [speechIndex, setSpeechIndex] = useState(0);
  const [equipped, setEquipped] = useState([]);

  useEffect(() => {
    const blinkTimer = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3200);
    return () => clearInterval(blinkTimer);
  }, []);

  useEffect(() => {
    const speechTimer = setInterval(() => {
      setSpeechIndex((i) => (i + 1) % SPEECH_SAMPLES.length);
    }, 4500);
    return () => clearInterval(speechTimer);
  }, []);

  const toggleItem = (id) => {
    setEquipped((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="min-h-screen bg-white pb-32 lg:ml-64 md:pb-0">
      <PageHeader icon={Sparkles} titleKey="mascotMockup.title" eyebrow="Design · Mascot" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16 space-y-8">
        {/* Hero concept */}
        <section className="card p-6 md:p-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-2">Concept</p>
              <h2 className="text-2xl md:text-3xl font-bold text-ink dark:text-gray-100 mb-3">
                Meet your Swim Coach — &ldquo;Aap&rdquo;
              </h2>
              <p className="text-ink-soft leading-relaxed mb-4">
                A cartoon monkey mascot that lives in the app, cheers you on after swims, blinks and bounces
                with subtle animations, and grows with your swim level. &ldquo;Aap&rdquo; means monkey in Dutch —
                a perfect fit for Aap-SC Swim Coach.
              </p>
              <ul className="space-y-2 text-sm text-ink-soft">
                <li className="flex items-center gap-2"><Sparkles size={16} className="text-brand shrink-0" /> Animated eyes, idle bounce, celebratory reactions</li>
                <li className="flex items-center gap-2"><Settings size={16} className="text-brand shrink-0" /> Male / female variant selectable in Settings</li>
                <li className="flex items-center gap-2"><Waves size={16} className="text-brand shrink-0" /> Visual upgrades tied to swim level (beginner → advanced)</li>
                <li className="flex items-center gap-2"><MessageCircle size={16} className="text-brand shrink-0" /> Speech bubbles with progress feedback & coaching tips</li>
                <li className="flex items-center gap-2"><ShoppingBag size={16} className="text-brand shrink-0" /> Purchasable cosmetics in the coin shop</li>
              </ul>
            </div>
            <div className="w-full lg:w-[420px] shrink-0 rounded-2xl overflow-hidden border border-black/5 shadow-lg">
              <Image
                src="/mascot/design-mockup.png"
                alt="Mascot design mockup showing level progression and shop items"
                width={840}
                height={840}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </section>

        {/* Interactive preview */}
        <section className="card p-6 md:p-8">
          <h2 className="text-xl font-bold text-ink dark:text-gray-100 mb-2">Interactive preview</h2>
          <p className="text-sm text-ink-soft mb-6">
            Toggle sex and level below. The mascot blinks automatically and cycles coaching messages.
          </p>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Mascot stage */}
            <div className="glass-thick rounded-2xl p-8 flex flex-col items-center justify-center min-h-[320px] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-tint/10 via-transparent to-brand-accent/10 pointer-events-none" />

              {/* Speech bubble */}
              <div className="relative z-10 mb-4 max-w-xs animate-[fadeIn_0.4s_ease]">
                <div className="glass rounded-2xl px-4 py-3 text-sm font-medium text-ink dark:text-gray-100 shadow-md border border-white/40">
                  {SPEECH_SAMPLES[speechIndex]}
                </div>
                <div className="w-4 h-4 bg-white/70 dark:bg-gray-800/70 rotate-45 mx-auto -mt-2 border-r border-b border-white/40" />
              </div>

              {/* Animated mascot */}
              <div className="relative z-10 animate-[mascotBounce_2.8s_ease-in-out_infinite]">
                <MascotSvg sex={sex} level={level} blink={blink} size={180} />
                {/* Equipped item badges */}
                <div className="absolute -top-2 -right-2 flex flex-wrap gap-1 max-w-[80px] justify-end">
                  {equipped.map((id) => {
                    const item = SHOP_ITEMS.find((s) => s.id === id);
                    return item ? (
                      <span key={id} className="text-lg drop-shadow-md" title={item.name}>{item.emoji}</span>
                    ) : null;
                  })}
                </div>
              </div>

              <p className="relative z-10 mt-4 text-xs text-ink-faint">
                {LEVEL_LABELS[level].label} · {sex === 'male' ? 'Male' : 'Female'} coach
              </p>
            </div>

            {/* Controls */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-ink-soft mb-2">Mascot sex (Settings)</label>
                <div className="flex gap-2">
                  {SEXES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSex(s)}
                      className={`flex-1 py-3 rounded-lg border transition font-medium ${
                        sex === s
                          ? 'border-brand bg-tint-soft text-[#2A45CC] dark:bg-tint/15'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-black/5'
                      }`}
                    >
                      {s === 'male' ? '♂ Male' : '♀ Female'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-soft mb-2">Swim level upgrade</label>
                <div className="flex gap-2">
                  {LEVELS.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLevel(l)}
                      className={`flex-1 py-3 rounded-lg border transition text-sm font-medium ${
                        level === l ? 'ring-2 ring-offset-2' : 'border-gray-200 dark:border-gray-700 hover:bg-black/5'
                      }`}
                      style={level === l ? { borderColor: LEVEL_LABELS[l].color, ringColor: LEVEL_LABELS[l].color } : {}}
                    >
                      {LEVEL_LABELS[l].label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-ink-faint mt-2">{LEVEL_LABELS[level].desc}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-soft mb-2">
                  <ShoppingBag size={14} className="inline mr-1" />
                  Shop items (tap to equip)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SHOP_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className={`p-3 rounded-xl border text-center transition ${
                        equipped.includes(item.id)
                          ? 'border-amber bg-amber/10 ring-1 ring-amber/40'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-black/5'
                      }`}
                    >
                      <span className="text-2xl block">{item.emoji}</span>
                      <span className="text-[10px] font-medium text-ink-soft block mt-1">{item.name}</span>
                      <span className="text-[10px] text-amber font-bold">{item.price} 🪙</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Level progression row */}
        <section className="card p-6 md:p-8">
          <h2 className="text-xl font-bold text-ink dark:text-gray-100 mb-2">Level progression</h2>
          <p className="text-sm text-ink-soft mb-6">
            The mascot&apos;s look evolves with your swim benchmark level — not a separate XP system.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {LEVELS.map((l) => (
              <div key={l} className="glass rounded-xl p-4 text-center">
                <div className="flex justify-center mb-2">
                  <MascotSvg sex="male" level={l} size={120} />
                </div>
                <p className="font-bold text-sm" style={{ color: LEVEL_LABELS[l].color }}>{LEVEL_LABELS[l].label}</p>
                <p className="text-xs text-ink-faint mt-1">{LEVEL_LABELS[l].desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Character sheet reference */}
        <section className="card p-6 md:p-8">
          <h2 className="text-xl font-bold text-ink dark:text-gray-100 mb-2">Character sheet</h2>
          <p className="text-sm text-ink-soft mb-4">
            Male vs female variants, blink animation frames, and speech bubble examples.
          </p>
          <div className="rounded-2xl overflow-hidden border border-black/5">
            <Image
              src="/mascot/variants-animation.png"
              alt="Mascot character sheet with male and female variants and animation frames"
              width={1200}
              height={800}
              className="w-full h-auto"
            />
          </div>
        </section>

        {/* Placement mockup */}
        <section className="card p-6 md:p-8">
          <h2 className="text-xl font-bold text-ink dark:text-gray-100 mb-2">Where the mascot appears</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {[
              { page: 'Progress', desc: 'Floating corner coach with weekly tip' },
              { page: 'Upload', desc: 'Celebrates after saving a session' },
              { page: 'Coins / Shop', desc: 'Models equipped items you buy' },
              { page: 'Settings', desc: 'Sex toggle + mascot preview panel' },
            ].map((placement) => (
              <div key={placement.page} className="glass rounded-xl p-4">
                <p className="font-bold text-brand text-sm">{placement.page}</p>
                <p className="text-xs text-ink-soft mt-1">{placement.desc}</p>
                <div className="mt-3 h-24 rounded-lg bg-gradient-to-br from-tint/10 to-brand-accent/10 flex items-end justify-center pb-1">
                  <MascotSvg sex={sex} level={level} size={64} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Design tokens */}
        <section className="card p-6 md:p-8">
          <h2 className="text-xl font-bold text-ink dark:text-gray-100 mb-4">Design tokens</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-2">Fur & face</p>
              <div className="flex gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#8B5E3C] border" title="#8B5E3C" />
                <span className="w-8 h-8 rounded-lg bg-[#F5DEB3] border" title="#F5DEB3" />
                <span className="w-8 h-8 rounded-lg bg-[#6B4423] border" title="#6B4423" />
              </div>
            </div>
            <div>
              <p className="font-semibold mb-2">Level colors</p>
              <div className="flex gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#F59E0B] border" title="Beginner" />
                <span className="w-8 h-8 rounded-lg bg-[#3B82F6] border" title="Intermediate" />
                <span className="w-8 h-8 rounded-lg bg-[#10B981] border" title="Advanced" />
              </div>
            </div>
            <div>
              <p className="font-semibold mb-2">App accents</p>
              <div className="flex gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#3B5BFF] border" title="Cobalt" />
                <span className="w-8 h-8 rounded-lg bg-[#E85A8C] border" title="Rose" />
                <span className="w-8 h-8 rounded-lg bg-[#F5A623] border" title="Coins" />
              </div>
            </div>
            <div>
              <p className="font-semibold mb-2">Style</p>
              <p className="text-ink-soft text-xs leading-relaxed">
                Rounded shapes, thick outlines, Duolingo-meets-Apple-Fitness. Glass speech bubbles matching Liquid OS cards.
              </p>
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        @keyframes mascotBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
