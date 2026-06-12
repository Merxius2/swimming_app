import { DEFAULT_THEME } from './appConstants';

const ICON_STYLES = {
  'liquid-os': {
    pageHeader: {
      wrapper: 'inline-flex w-9 h-9 items-center justify-center rounded-full glass',
      icon: 'text-[#2A45CC]',
      iconSize: 18,
    },
    section: {
      icon: 'text-brand-primary',
      iconSize: 28,
    },
    inline: {
      icon: 'text-brand-primary',
    },
    tile: {
      tint:   { bg: 'bg-tint-soft',   fg: 'text-[#2A45CC]' },
      violet: { bg: 'bg-violet-soft', fg: 'text-[#4F3FA0]' },
      mint:   { bg: 'bg-mint-soft',   fg: 'text-[#1F8E6E]' },
      amber:  { bg: 'bg-amber-soft',  fg: 'text-[#8B5E20]' },
      coral:  { bg: 'bg-coral-soft',  fg: 'text-[#A8302A]' },
    },
  },
  'gen-z': {
    pageHeader: {
      wrapper:
        'inline-flex w-9 h-9 items-center justify-center rounded-full bg-[#6200EE] border-2 border-[#D4FF00]/30 shadow-[0_3px_0_rgba(0,0,0,0.15)]',
      icon: 'text-[#D4FF00]',
      iconSize: 18,
    },
    section: {
      wrapper:
        'inline-flex w-10 h-10 items-center justify-center rounded-2xl bg-[#6200EE] border-2 border-[#D4FF00]/30 shadow-[0_3px_0_rgba(0,0,0,0.15)] flex-shrink-0',
      icon: 'text-[#D4FF00]',
      iconSize: 22,
    },
    inline: {
      wrapper:
        'inline-flex w-8 h-8 items-center justify-center rounded-xl bg-[#6200EE] border-2 border-[#D4FF00]/25 shadow-[0_2px_0_rgba(0,0,0,0.12)] flex-shrink-0',
      icon: 'text-[#D4FF00]',
      iconSize: 16,
    },
    tile: {
      tint:   { bg: 'bg-[#6200EE] border-2 border-[#D4FF00]/30 shadow-[0_3px_0_rgba(0,0,0,0.12)]', fg: 'text-[#D4FF00]' },
      violet: { bg: 'bg-[#7B2CBF] border-2 border-[#D4FF00]/25 shadow-[0_3px_0_rgba(0,0,0,0.12)]', fg: 'text-[#D4FF00]' },
      mint:   { bg: 'bg-[#D4FF00] border-2 border-[#6200EE]/20 shadow-[0_3px_0_rgba(98,0,238,0.15)]', fg: 'text-[#1A1A1A]' },
      amber:  { bg: 'bg-[#FFE566] border-2 border-[#6200EE]/15 shadow-[0_3px_0_rgba(98,0,238,0.12)]', fg: 'text-[#1A1A1A]' },
      coral:  { bg: 'bg-[#FF69B4] border-2 border-white/30 shadow-[0_3px_0_rgba(98,0,238,0.15)]', fg: 'text-white' },
    },
  },
  classic: {
    pageHeader: {
      wrapper:
        'inline-flex w-9 h-9 items-center justify-center rounded-full bg-[#C8C8C8] border border-black/15 shadow-[inset_0_2px_4px_rgba(0,0,0,0.18),inset_0_-1px_0_rgba(255,255,255,0.35)]',
      icon: 'text-[#008FD6]',
      iconSize: 18,
    },
    section: {
      wrapper:
        'inline-flex w-10 h-10 items-center justify-center rounded-xl bg-[#C8C8C8] border border-black/15 shadow-[inset_0_2px_4px_rgba(0,0,0,0.18),inset_0_-1px_0_rgba(255,255,255,0.35)] flex-shrink-0 border-b-[3px] border-b-[#0070FF]',
      icon: 'text-[#008FD6]',
      iconSize: 22,
    },
    inline: {
      wrapper:
        'inline-flex w-8 h-8 items-center justify-center rounded-lg bg-[#C8C8C8] border border-black/12 shadow-[inset_0_2px_3px_rgba(0,0,0,0.15)] flex-shrink-0',
      icon: 'text-[#008FD6]',
      iconSize: 16,
    },
    tile: {
      tint:   { bg: 'bg-[#C8C8C8] border border-black/15 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)] border-b-[3px] border-b-[#008FD6]', fg: 'text-[#008FD6]' },
      violet: { bg: 'bg-[#C8C8C8] border border-black/15 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)] border-b-[3px] border-b-[#008FD6]', fg: 'text-[#008FD6]' },
      mint:   { bg: 'bg-[#C8C8C8] border border-black/15 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)] border-b-[3px] border-b-[#00AB9F]', fg: 'text-[#007A70]' },
      amber:  { bg: 'bg-[#C8C8C8] border border-black/15 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)] border-b-[3px] border-b-[#F3AF00]', fg: 'text-[#8B6914]' },
      coral:  { bg: 'bg-[#C8C8C8] border border-black/15 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)] border-b-[3px] border-b-[#DF0024]', fg: 'text-[#DF0024]' },
    },
  },
};

export function getThemeIconStyles(theme, variant = 'section') {
  const themeStyles = ICON_STYLES[theme] || ICON_STYLES[DEFAULT_THEME];
  return themeStyles[variant] || ICON_STYLES[DEFAULT_THEME][variant];
}

export function getThemeTileIconStyles(theme, tint = 'tint') {
  const tileStyles = getThemeIconStyles(theme, 'tile');
  return tileStyles[tint] || tileStyles.tint;
}
