import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

/**
 * Shared Stack chrome for a module's screen group. Each domain (marketplace,
 * food, …) tints its back button/header with its own accent color so the
 * color-coding from the home dashboard carries through into navigation.
 * Individual screens set their own title via an inline <Stack.Screen
 * options={{ title }} />.
 */
export function ModuleStack({ accent }: { accent: string }) {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerTintColor: accent,
        headerTitleStyle: { color: theme.text },
        headerStyle: { backgroundColor: theme.background },
        headerShadowVisible: false,
      }}
    />
  );
}
