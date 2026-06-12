/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Liquid OS palette — light theme primary
        ink:    { DEFAULT: '#0B0D14', soft: '#5A6072', faint: '#9AA0B0' },
        base:   { DEFAULT: '#EEF1F6', deep: '#E4E8F0' },
        // Signals
        mint:   { DEFAULT: '#3DCBA5', soft: '#CFF1E5' },
        coral:  { DEFAULT: '#FF6A5C', soft: '#FFD9D3' },
        amber:  { DEFAULT: '#F5A623', soft: '#FCE7C2' },
        violet: { DEFAULT: '#7B5BFF', soft: '#E0DBFF' },
        rose:   { DEFAULT: '#E85A8C', soft: '#FAD2DE' },

        // Brand aliases — KEPT for backwards compatibility with existing pages
        // (every from-brand-primary to-brand-secondary now resolves to the new gradient)
        brand: {
          primary:   '#3B5BFF', // was #3B82F6
          secondary: '#7B5BFF', // was #8B5CF6
          accent:    '#E85A8C', // was #EC4899
          success:   '#3DCBA5', // was #10B981
          warning:   '#F5A623', // was #F59E0B
        },

        // Legacy light/dark scales — kept identical to original for backward compat
        light: {
          50:  '#FFFFFF',
          100: '#F9FAFB',
          200: '#F3F4F6',
          300: '#E5E7EB',
          400: '#D1D5DB',
        },
        dark: {
          50:  '#1F2937',
          100: '#111827',
          200: '#0F172A',
          300: '#1E293B',
          400: '#334155',
        },
      },
      fontFamily: {
        // Replaced — see /pages/_document.js for the font links
        sans: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      // Conservative radius scale — close enough to vanilla Tailwind that
      // `rounded-2xl` on a small KPI card still looks like a card, but with
      // a touch more softness for the Liquid OS feel.
      borderRadius: {
        sm:    '10px',
        md:    '14px',
        lg:    '18px',
        xl:    '22px',
        '2xl': '24px',
        '3xl': '32px',
      },
      backgroundImage: {
        // Kept identical key names so existing `card-income` etc. resolve.
        // All four gradients are now tonally-neutral so they no longer look like a rainbow.
        'gradient-light-top': 'linear-gradient(180deg, rgba(123,91,255,0.05) 0%, rgba(59,91,255,0.03) 15%, rgba(255,255,255,0) 40%)',
        'gradient-income':    'linear-gradient(135deg, rgba(59,91,255,0.06) 0%, rgba(255,255,255,0.4) 100%)',
        'gradient-savings':   'linear-gradient(135deg, rgba(61,203,165,0.06) 0%, rgba(255,255,255,0.4) 100%)',
        'gradient-expenses':  'linear-gradient(135deg, rgba(123,91,255,0.06) 0%, rgba(255,255,255,0.4) 100%)',
        'gradient-summary':   'linear-gradient(135deg, rgba(245,166,35,0.06) 0%, rgba(255,255,255,0.4) 100%)',
        'gradient-chart':     'linear-gradient(180deg, rgba(59,91,255,0.4) 0%, rgba(123,91,255,0.2) 50%, rgba(255,255,255,0) 100%)',
      },
      boxShadow: {
        'soft':    '0 1px 2px rgba(11,13,20,0.04), 0 1px 3px rgba(11,13,20,0.06)',
        'soft-md': '0 4px 12px rgba(11,13,20,0.06), 0 2px 4px rgba(11,13,20,0.04)',
        'soft-lg': '0 8px 24px rgba(11,13,20,0.08), 0 4px 8px rgba(11,13,20,0.04)',
        'glow-green': '0 0 20px rgba(61,203,165,0.3)',
        'glow-amber': '0 0 20px rgba(245,166,35,0.3)',
        'pill-tint': '0 8px 24px -8px rgba(59,91,255,0.55), 0 2px 4px rgba(59,91,255,0.2)',
      },
    },
  },
  plugins: [],
};
