import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TabsProps<T extends string | number | null> = {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
};

/** Underlined text tabs — e.g. the menu category selector on a restaurant page. */
export function Tabs<T extends string | number | null>({ options, value, onChange }: TabsProps<T>) {
  const theme = useTheme();

  return (
    <View style={[styles.row, { borderBottomColor: theme.border }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollRow}>
        {options.map((opt) => {
          const selected = opt.id === value;
          return (
            <Pressable key={String(opt.id)} onPress={() => onChange(opt.id)} accessibilityRole="tab" accessibilityState={{ selected }}>
              <View style={[styles.tab, selected && { borderBottomColor: theme.primary }]}>
                <ThemedText type="small" style={{ color: selected ? theme.primary : theme.textTertiary, fontWeight: selected ? '600' : '500' }}>
                  {opt.label}
                </ThemedText>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { borderBottomWidth: 1 },
  scrollRow: { flexDirection: 'row', gap: Spacing.four },
  tab: { paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
});
