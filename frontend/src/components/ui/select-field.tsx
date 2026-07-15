import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
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
        style={[styles.input, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}
      >
        <ThemedText style={{ color: selected ? theme.text : theme.textSecondary }}>
          {selected ? selected.label : placeholder}
        </ThemedText>
        <SymbolView name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }} tintColor={theme.textSecondary} size={16} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: theme.background }]}>
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
                  style={[styles.option, item.value === value && { backgroundColor: theme.backgroundSelected }]}
                >
                  <ThemedText>{item.label}</ThemedText>
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
    height: 48,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    padding: Spacing.four,
    maxHeight: '70%',
  },
  sheetTitle: { fontSize: 18, marginBottom: Spacing.two },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.one,
    borderRadius: Spacing.one,
  },
});
