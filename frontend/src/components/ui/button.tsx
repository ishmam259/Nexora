import { ActivityIndicator, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, variant = 'primary', loading, disabled, style }: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const backgroundColor = {
    primary: theme.primary,
    secondary: theme.backgroundSelected,
    danger: theme.danger,
    ghost: 'transparent',
  }[variant];

  const textColor = variant === 'secondary' || variant === 'ghost' ? theme.text : theme.onPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor, opacity: isDisabled ? 0.6 : pressed ? 0.85 : 1 },
        variant === 'ghost' && { borderWidth: 1, borderColor: theme.border },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={textColor} /> : <ThemedText style={[styles.label, { color: textColor }]}>{label}</ThemedText>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  label: { fontSize: 15, fontWeight: '600' },
});
