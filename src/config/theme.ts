/**
 * Shared app theme tokens (Farmapro — aligned with pos-dashboard).
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  text: '#0b1f17',
  background: '#f5f7f5',          // was '#FFFFFF' — now ink-50, matches dashboard --background
  backgroundElement: '#ecfdf5',
  backgroundSelected: '#d1fae5',
  textSecondary: '#5b7268',
} as const;

export type ThemeColor = keyof typeof Colors;

export const Fonts = Platform.select({
  ios: {
    sans: 'PlusJakartaSans_400Regular',
    serif: 'ui-serif',
    rounded: 'PlusJakartaSans_500Medium',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'PlusJakartaSans_400Regular',
    serif: 'serif',
    rounded: 'PlusJakartaSans_500Medium',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
