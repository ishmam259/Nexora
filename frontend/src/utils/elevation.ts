import { Platform, ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type ElevationLevel = 'none' | 'sm' | 'md';

export function useElevation(level: ElevationLevel): ViewStyle {
  const theme = useTheme();

  if (level === 'none') {
    return {};
  }

  if (Platform.OS === 'android') {
    return { elevation: level === 'sm' ? 3 : 6 };
  }

  return {
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: level === 'sm' ? 4 : 10 },
    shadowOpacity: level === 'sm' ? 0.06 : 0.1,
    shadowRadius: level === 'sm' ? 12 : 24,
  };
}
