import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MinTouchTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
};

export function TextField({ label, error, hint, style, accessibilityLabel, ...rest }: TextFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      {label && (
        <ThemedText type="smallBold" accessibilityRole="text">
          {label}
        </ThemedText>
      )}
      <TextInput
        accessibilityLabel={accessibilityLabel ?? label ?? rest.placeholder}
        placeholderTextColor={theme.textTertiary}
        style={[
          styles.input,
          {
            color: theme.text,
            borderColor: error ? theme.danger : theme.border,
            backgroundColor: theme.backgroundElement,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <ThemedText type="caption" themeColor="danger" accessibilityRole="alert">
          {error}
        </ThemedText>
      ) : hint ? (
        <ThemedText type="caption" themeColor="textTertiary">
          {hint}
        </ThemedText>
      ) : null}
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
    fontSize: 16,
  },
});
