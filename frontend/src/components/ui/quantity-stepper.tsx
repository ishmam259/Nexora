import { Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
};

/** +/- quantity control matching the `.qty` stepper in the design system. */
export function QuantityStepper({ value, onChange, min = 0, max = 99, label }: QuantityStepperProps) {
  const theme = useTheme();

  return (
    <View style={[styles.wrap, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
      <Pressable
        onPress={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        accessibilityRole="button"
        accessibilityLabel={label ? `Decrease ${label}` : 'Decrease'}
        style={styles.btn}
      >
        <SymbolView name={{ ios: 'minus', android: 'remove', web: 'remove' }} tintColor={value <= min ? theme.textTertiary : theme.text} size={14} />
      </Pressable>
      <ThemedText type="smallBold" style={styles.value}>
        {value}
      </ThemedText>
      <Pressable
        onPress={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        accessibilityRole="button"
        accessibilityLabel={label ? `Increase ${label}` : 'Increase'}
        style={styles.btn}
      >
        <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} tintColor={value >= max ? theme.textTertiary : theme.text} size={14} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderWidth: 1,
    borderRadius: Radius.sm,
  },
  btn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  value: { minWidth: 22, textAlign: 'center' },
});
