import { Pressable, StyleSheet, View } from 'react-native';
import { SymbolView, SymbolViewProps } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Modern springboard tile — soft glowing icon plate, label below, no card chrome.
 * 3-column grid for larger, more tappable targets.
 */
export function SpringboardIcon({
  label,
  icon,
  color,
  onPress,
}: {
  label: string;
  icon: SymbolViewProps['name'];
  color: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.tile,
        {
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
      ]}
    >
      <View
        style={[
          styles.glow,
          {
            backgroundColor: color + '22',
            shadowColor: color,
          },
        ]}
      >
        <View style={[styles.iconPlate, { backgroundColor: color }]}>
          <SymbolView name={icon} tintColor="#FFFFFF" size={26} />
        </View>
      </View>
      <ThemedText type="caption" style={[styles.label, { color: theme.text }]} numberOfLines={2}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: '33.333%',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  glow: {
    borderRadius: 22,
    padding: 3,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  iconPlate: {
    width: 62,
    height: 62,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
    fontWeight: '600',
    maxWidth: 88,
    fontSize: 12,
    lineHeight: 16,
  },
});
