import '@/global.css';

import { Platform } from 'react-native';

/**
 * Cool modern palette — teal brand (not purple-on-white), soft canvas,
 * borderless surfaces that rely on elevation instead of hairlines.
 */
export const Colors = {
  light: {
    text: '#0B1220',
    textSecondary: '#5B6575',
    textTertiary: '#8A93A3',
    background: '#F3F5F8',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E8ECF2',
    primary: '#0F766E',
    primaryMuted: '#CCFBF1',
    onPrimary: '#FFFFFF',
    border: '#D8DEE8',
    borderSubtle: '#E8ECF2',
    shadow: '#0B1220',
    success: '#059669',
    successMuted: '#ECFDF5',
    danger: '#E11D48',
    dangerMuted: '#FFF1F2',
    warning: '#D97706',
    warningMuted: '#FFFBEB',
  },
  dark: {
    text: '#F4F6FA',
    textSecondary: '#A0A8B8',
    textTertiary: '#6E7788',
    background: '#0A0D14',
    backgroundElement: '#141924',
    backgroundSelected: '#1E2533',
    primary: '#2DD4BF',
    primaryMuted: '#134E4A',
    onPrimary: '#042F2E',
    border: '#2A3344',
    borderSubtle: '#1E2533',
    shadow: '#000000',
    success: '#34D399',
    successMuted: '#064E3B',
    danger: '#FB7185',
    dangerMuted: '#4C0519',
    warning: '#FBBF24',
    warningMuted: '#451A03',
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
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

export const MinTouchTarget = 44;

export const BottomTabInset = Platform.select({ ios: 56, android: 72, web: 68 }) ?? 68;
export const MaxContentWidth = 800;
