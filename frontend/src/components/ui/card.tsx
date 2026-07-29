import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useElevation } from '@/utils/elevation';

type CardProps = {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  elevated?: boolean;
};

export function Card({ children, onPress, style, accessibilityLabel, elevated = true }: CardProps) {
  const theme = useTheme();
  const elevation = useElevation(elevated ? 'sm' : 'none');

  const cardStyle = [
    styles.card,
    { backgroundColor: theme.backgroundElement },
    elevation,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
      >
        <ThemedView style={cardStyle}>{children}</ThemedView>
      </Pressable>
    );
  }

  return <ThemedView style={cardStyle}>{children}</ThemedView>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.two,
  },
});
