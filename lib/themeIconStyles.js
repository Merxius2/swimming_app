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
  'olympic-pool': {
    pageHeader: {
      wrapper: 'inline-flex w-9 h-9 items-center justify-center rounded-lg bg-[#0066CC] border-2 border-[#F5C518]/50',
      icon: 'text-white',
      iconSize: 18,
    },
    section: {
      wrapper: 'inline-flex w-10 h-10 items-center justify-center rounded-lg bg-[#0066CC] border-b-[3px] border-b-[#F5C518] flex-shrink-0',
      icon: 'text-white',
      iconSize: 22,
    },
    inline: {
      icon: 'text-[#0066CC]',
    },
    tile: {
      tint:   { bg: 'bg-[#E2E8F0] border-2 border-[#0066CC]/25', fg: 'text-[#0066CC]' },
      violet: { bg: 'bg-[#E2E8F0] border-2 border-[#0066CC]/25', fg: 'text-[#0066CC]' },
      mint:   { bg: 'bg-[#0066CC]/10 border-2 border-[#0066CC]/30', fg: 'text-[#004C99]' },
      amber:  { bg: 'bg-[#F5C518]/20 border-2 border-[#F5C518]/50', fg: 'text-[#8B6914]' },
      coral:  { bg: 'bg-[#0066CC] border-2 border-[#F5C518]/40', fg: 'text-white' },
    },
  },
  'midnight-lane': {
    pageHeader: {
      wrapper: 'inline-flex w-9 h-9 items-center justify-center rounded-full bg-[#0F172A] border border-[#22D3EE]/40 shadow-[0_0_12px_rgba(34,211,238,0.35)]',
      icon: 'text-[#22D3EE]',
      iconSize: 18,
    },
    section: {
      wrapper: 'inline-flex w-10 h-10 items-center justify-center rounded-xl bg-[#0F172A] border border-[#22D3EE]/35 shadow-[0_0_14px_rgba(34,211,238,0.25)] flex-shrink-0',
      icon: 'text-[#22D3EE]',
      iconSize: 22,
    },
    inline: { icon: 'text-[#22D3EE]' },
    tile: {
      tint:   { bg: 'bg-[#0F172A] border border-[#22D3EE]/30', fg: 'text-[#22D3EE]' },
      violet: { bg: 'bg-[#0F172A] border border-[#22D3EE]/30', fg: 'text-[#22D3EE]' },
      mint:   { bg: 'bg-[#0891B2]/20 border border-[#22D3EE]/25', fg: 'text-[#67E8F9]' },
      amber:  { bg: 'bg-[#0F172A] border border-[#22D3EE]/20', fg: 'text-[#94A3B8]' },
      coral:  { bg: 'bg-[#0891B2]/30 border border-[#22D3EE]/40', fg: 'text-[#CFFAFE]' },
    },
  },
  'retro-wave': {
    pageHeader: {
      wrapper: 'inline-flex w-9 h-9 items-center justify-center rounded-lg bg-[#1E0A33] border-2 border-[#FF6EC7]/50 shadow-[0_0_14px_rgba(255,110,199,0.35)]',
      icon: 'text-[#FF6EC7]',
      iconSize: 18,
    },
    section: {
      wrapper: 'inline-flex w-10 h-10 items-center justify-center rounded-xl bg-[#1E0A33] border-2 border-[#FF6EC7]/45 shadow-[0_0_16px_rgba(157,78,221,0.35)] flex-shrink-0',
      icon: 'text-[#FF6EC7]',
      iconSize: 22,
    },
    inline: { icon: 'text-[#FF6EC7]' },
    tile: {
      tint:   { bg: 'bg-[#1E0A33] border-2 border-[#9D4EDD]/45', fg: 'text-[#FF6EC7]' },
      violet: { bg: 'bg-[#2D1B69] border-2 border-[#9D4EDD]/50', fg: 'text-[#C4B5FD]' },
      mint:   { bg: 'bg-[#1E0A33] border-2 border-[#5CE1E6]/40', fg: 'text-[#5CE1E6]' },
      amber:  { bg: 'bg-[#FF6EC7]/15 border-2 border-[#FF6EC7]/40', fg: 'text-[#FF6EC7]' },
      coral:  { bg: 'bg-gradient-to-br from-[#9D4EDD] to-[#FF6EC7] border border-white/20', fg: 'text-white' },
    },
  },
  'tropical-open': {
    pageHeader: {
      wrapper: 'inline-flex w-9 h-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0D9488] to-[#FB7185]',
      icon: 'text-white',
      iconSize: 18,
    },
    section: {
      wrapper: 'inline-flex w-10 h-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0D9488] to-[#38BDF8] flex-shrink-0 shadow-md',
      icon: 'text-white',
      iconSize: 22,
    },
    inline: { icon: 'text-[#0D9488]' },
    tile: {
      tint:   { bg: 'bg-[#CCFBF1] border border-[#0D9488]/25', fg: 'text-[#0F766E]' },
      violet: { bg: 'bg-[#E0F2FE] border border-[#38BDF8]/30', fg: 'text-[#0284C7]' },
      mint:   { bg: 'bg-[#CCFBF1] border border-[#5EEAD4]/40', fg: 'text-[#0D9488]' },
      amber:  { bg: 'bg-[#FFF7ED] border border-[#FB7185]/30', fg: 'text-[#E11D48]' },
      coral:  { bg: 'bg-gradient-to-br from-[#0D9488] to-[#FB7185]', fg: 'text-white' },
    },
  },
  'gold-luxe': {
    pageHeader: {
      wrapper: 'inline-flex w-9 h-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#F59E0B] to-[#92400E] border-2 border-[#FBBF24]/50',
      icon: 'text-[#FFFBEB]',
      iconSize: 18,
    },
    section: {
      wrapper: 'inline-flex w-10 h-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#D97706] to-[#92400E] border-b-[3px] border-b-[#FBBF24] flex-shrink-0',
      icon: 'text-[#FFFBEB]',
      iconSize: 22,
    },
    inline: { icon: 'text-[#D97706]' },
    tile: {
      tint:   { bg: 'bg-[#FEF3C7] border-2 border-[#F59E0B]/30', fg: 'text-[#92400E]' },
      violet: { bg: 'bg-[#FFFBEB] border-2 border-[#F59E0B]/25', fg: 'text-[#B45309]' },
      mint:   { bg: 'bg-[#FEF3C7] border-2 border-[#FBBF24]/40', fg: 'text-[#92400E]' },
      amber:  { bg: 'bg-[#FBBF24]/20 border-2 border-[#F59E0B]/45', fg: 'text-[#78350F]' },
      coral:  { bg: 'bg-gradient-to-br from-[#F59E0B] to-[#92400E]', fg: 'text-[#FFFBEB]' },
    },
  },
  'platinum-elite': {
    pageHeader: {
      wrapper: 'inline-flex w-9 h-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#64748B] to-[#334155] border-2 border-[#A5B4FC]/45',
      icon: 'text-[#F8FAFC]',
      iconSize: 18,
    },
    section: {
      wrapper: 'inline-flex w-10 h-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#475569] to-[#1E293B] border-b-[3px] border-b-[#A5B4FC] flex-shrink-0',
      icon: 'text-[#F8FAFC]',
      iconSize: 22,
    },
    inline: { icon: 'text-[#475569]' },
    tile: {
      tint:   { bg: 'bg-[#E2E8F0] border-2 border-[#94A3B8]/30', fg: 'text-[#334155]' },
      violet: { bg: 'bg-[#EEF2FF] border-2 border-[#A5B4FC]/35', fg: 'text-[#4338CA]' },
      mint:   { bg: 'bg-[#F1F5F9] border-2 border-[#94A3B8]/25', fg: 'text-[#475569]' },
      amber:  { bg: 'bg-[#F8FAFC] border-2 border-[#CBD5E1]/45', fg: 'text-[#64748B]' },
      coral:  { bg: 'bg-gradient-to-br from-[#64748B] to-[#334155]', fg: 'text-[#F8FAFC]' },
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
