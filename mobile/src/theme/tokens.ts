/* ════════════════════════════════════════════════
   CENIT — Design tokens (native port of globals.css)
   Brand palette drawn from the logotype:
     deep navy "cenit" wordmark · antique-gold dot · cream field
   Theme: LIGHT — cream surfaces, navy ink, gold accent
════════════════════════════════════════════════ */
import { Platform } from 'react-native';

export const palette = {
  navy: '#16263F',
  gold: '#B0832E',
  goldHi: '#946E25',
  goldSoft: '#D8B061',
  goldDeep: '#8A6522',
  cream: '#F5F1E8',

  /* warm white → cream surface ramp */
  bg: '#FBFAF7',
  bg1: '#FFFFFF',
  bg2: '#F4F1EA',
  bg3: '#ECE7DB',
  bg4: '#E0D9C9',

  /* navy ink ramp */
  ink1: '#16263F',
  ink2: 'rgba(22,38,63,0.66)',
  ink3: 'rgba(22,38,63,0.45)',
  ink4: 'rgba(22,38,63,0.14)',

  line: 'rgba(22,38,63,0.11)',
  line2: 'rgba(22,38,63,0.17)',

  amber: '#B0832E',
  amberHi: '#946E25',
  amberLo: 'rgba(176,131,46,0.12)',
  amberBr: 'rgba(176,131,46,0.40)',

  ok: '#2E9E6B',
  err: '#CF5238',

  white: '#FFFFFF',
} as const;

export const radius = {
  sm: 8,
  md: 11,
  lg: 14,
  xl: 18,
  pill: 999,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/* Serif for headlines/logotype (Fraunces stand-in), sans for UI. */
export const fonts = {
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  serifWeight: '600' as const,
  sans: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
};

/* Soft brand card shadow (iOS). */
export const cardShadow = {
  shadowColor: '#16263F',
  shadowOpacity: 0.12,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 14 },
  elevation: 4,
} as const;

export const goldShadow = {
  shadowColor: palette.gold,
  shadowOpacity: 0.45,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 },
  elevation: 6,
} as const;

export const ease = [0.22, 1, 0.36, 1] as const;
