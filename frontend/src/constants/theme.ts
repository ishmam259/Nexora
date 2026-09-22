import '@/global.css';

import { Platform } from 'react-native';

/**
 * Nexora Campus OS palette — warm sandstone canvas with a brick accent,
 * carried over from the IUT campus app design (see docs/design-system.md).
 */
export const Colors = {
  light: {
    text: '#1D1814',
    textSecondary: '#50463E',
    textTertiary: '#A2978C',
    background: '#F7F5F2',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#F3EFEA',
    tile: '#FAF1E6',
    thumb: '#F0EBE5',
    primary: '#A5472A',
    primaryMuted: '#F6EDEA',
    onPrimary: '#FFFFFF',
    border: '#DAD2C8',
    borderSubtle: '#F0EBE5',
    shadow: '#3C1E0F',
    success: '#1B7A43',
    successMuted: '#E3F1E7',
    danger: '#B3261E',
    dangerMuted: '#F7E9E8',
    warning: '#9C6B12',
    warningMuted: '#F5F0E7',
    heroBg: '#7C3420',
    heroText: '#FFFFFF',
    heroMuted: '#EBCFC4',
  },
  dark: {
    text: '#EDE8E3',
    textSecondary: '#BDB3A9',
    textTertiary: '#6E655D',
    background: '#12100E',
    backgroundElement: '#1B1816',
    backgroundSelected: '#25211E',
    tile: '#241E1A',
    thumb: '#25211E',
    primary: '#B05D44',
    primaryMuted: '#39221A',
    onPrimary: '#FFFFFF',
    border: '#3A342F',
    borderSubtle: '#25211E',
    shadow: '#000000',
    success: '#62C08A',
    successMuted: '#14301F',
    danger: '#CE726D',
    dangerMuted: '#361B17',
    warning: '#C4A671',
    warningMuted: '#372A15',
    heroBg: '#3A1F16',
    heroText: '#F7F1EC',
    heroMuted: '#D6B7AA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
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
  four: 20,
  five: 24,
  six: 32,
  seven: 48,
} as const;

export const Radius = {
  sm: 10,
  md: 12,
  lg: 14,
  xl: 16,
  full: 999,
} as const;

export const MinTouchTarget = 44;

export const BottomTabInset = Platform.select({ ios: 56, android: 72, web: 68 }) ?? 68;
export const MaxContentWidth = 800;
