import { Stack } from 'expo-router';
import { Platform } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export function ModuleStack({ accent }: { accent: string }) {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerTintColor: accent,
        headerTitleStyle: {
          color: theme.text,
          fontWeight: '600',
          fontSize: 17,
        },
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerShadowVisible: false,
        headerBackTitle: Platform.OS === 'ios' ? 'Back' : undefined,
        contentStyle: { backgroundColor: theme.background },
      }}
    />
  );
}
