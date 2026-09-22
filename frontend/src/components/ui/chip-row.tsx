import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ChipOption<T extends string | number | null> = { id: T; label: string };

type ChipRowProps<T extends string | number | null> = {
  options: ChipOption<T>[];
  value: T;
  onChange: (id: T) => void;
};

/** Horizontal filter chips — ink-filled when selected, matching the Nexora design system. */
export function ChipRow<T extends string | number | null>({ options, value, onChange }: ChipRowProps<T>) {
  const theme = useTheme();

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={options}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.row}
      renderItem={({ item }) => {
        const selected = item.id === value;
        return (
          <Pressable onPress={() => onChange(item.id)} accessibilityRole="button" accessibilityState={{ selected }}>
            <View
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? theme.text : theme.backgroundElement,
                  borderColor: selected ? theme.text : theme.border,
                },
              ]}
            >
              <ThemedText
                type="caption"
                style={{ color: selected ? theme.background : theme.textSecondary, fontWeight: selected ? '600' : '500' }}
              >
                {item.label}
              </ThemedText>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  row: { gap: Spacing.two },
  chip: {
    height: 34,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
