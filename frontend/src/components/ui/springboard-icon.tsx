import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MODULE_ILLUSTRATIONS } from '@/components/ui/module-illustrations';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Springboard tile — the module's hand-drawn illustration on an organic
 * "blob" plate (rounded top, tighter bottom corners), label below.
 * Matches the Nexora Campus OS module tiles exactly.
 */
export function SpringboardIcon({
  label,
  moduleKey,
  onPress,
}: {
  label: string;
  moduleKey: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  const Illustration = MODULE_ILLUSTRATIONS[moduleKey];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.tile,
        {
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}
    >
      <View style={[styles.plate, { backgroundColor: theme.tile }]}>
        {Illustration && <Illustration size={56} />}
        <ThemedText type="caption" style={[styles.label, { color: theme.text }]} numberOfLines={2}>
          {label}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: '33.333%',
    paddingHorizontal: Spacing.one,
    paddingVertical: Spacing.one,
  },
  plate: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    paddingHorizontal: Spacing.one,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  label: {
    textAlign: 'center',
    fontWeight: '600',
    maxWidth: 96,
    fontSize: 12,
    lineHeight: 16,
  },
});
