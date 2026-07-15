import { Pressable, StyleSheet } from 'react-native';
import { SymbolView, SymbolViewProps } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function ModuleCard({
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
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrapper, { opacity: pressed ? 0.8 : 1 }]}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedView style={[styles.iconWrap, { backgroundColor: color + '26' }]}>
          <SymbolView name={icon} tintColor={color} size={22} />
        </ThemedView>
        <ThemedText type="smallBold" style={{ color: theme.text }}>
          {label}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '31%' },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.two,
    gap: Spacing.two,
    aspectRatio: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
