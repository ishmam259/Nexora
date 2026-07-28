import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { MinTouchTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface SelectOption<T extends string = string> {
  label: string;
  value: T;
}

type SelectFieldProps<T extends string> = {
  label?: string;
  value: T | null;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
};

export function SelectField<T extends string>({ label, value, options, onChange, placeholder = 'Select…' }: SelectFieldProps<T>) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.wrapper}>
      {label && <ThemedText type="smallBold">{label}</ThemedText>}
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label ? `${label}: ${selected?.label ?? placeholder}` : selected?.label ?? placeholder}
        style={[styles.input, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}
      >
        <ThemedText style={{ color: selected ? theme.text : theme.textTertiary }}>
          {selected ? selected.label : placeholder}
        </ThemedText>
        <SymbolView name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }} tintColor={theme.textTertiary} size={16} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: theme.backgroundElement }]}>
            {label && (
              <ThemedText type="subtitle" style={styles.sheetTitle}>
                {label}
              </ThemedText>
            )}
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: item.value === value }}
                  style={[styles.option, item.value === value && { backgroundColor: theme.primaryMuted }]}
                >
                  <ThemedText type="smallBold" style={item.value === value ? { color: theme.primary } : undefined}>
                    {item.label}
                  </ThemedText>
                  {item.value === value && (
                    <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} tintColor={theme.primary} size={18} />
                  )}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.one },
  input: {
    minHeight: MinTouchTarget,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.four,
    maxHeight: '70%',
  },
  sheetTitle: { marginBottom: Spacing.two },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.md,
    minHeight: MinTouchTarget,
  },
});
