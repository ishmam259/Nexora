import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type OptionCardProps = {
  label: string;
  meta?: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
};

/** Selectable option tile matching the `.opt` / `.opt.on` cards in the design system. */
export function OptionCard({ label, meta, selected, disabled, onPress }: OptionCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      style={[
        styles.card,
        {
          borderColor: selected ? theme.primary : theme.border,
          borderWidth: selected ? 2 : 1,
          backgroundColor: selected ? theme.primaryMuted : theme.backgroundElement,
          opacity: disabled ? 0.5 : 1,
          padding: selected ? Spacing.two - 1 : Spacing.two,
        },
      ]}
    >
      <ThemedText type="small" style={{ fontWeight: '600' }}>
        {label}
      </ThemedText>
      {meta && (
        <ThemedText type="caption" themeColor="textSecondary" style={styles.meta}>
          {meta}
        </ThemedText>
      )}
      {selected && <View style={[styles.dot, { backgroundColor: theme.primary }]} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    borderRadius: Radius.lg,
    gap: 4,
  },
  meta: { fontVariant: ['tabular-nums'] },
  dot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4 },
});
