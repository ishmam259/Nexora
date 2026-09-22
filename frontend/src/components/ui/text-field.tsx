import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { SymbolView, SymbolViewProps } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { MinTouchTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  icon?: SymbolViewProps['name'];
};

export function TextField({ label, error, hint, icon, style, accessibilityLabel, ...rest }: TextFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      {label && (
        <ThemedText type="smallBold" accessibilityRole="text">
          {label}
        </ThemedText>
      )}
      <View style={styles.inputWrap}>
        {icon && (
          <View style={styles.icon} pointerEvents="none">
            <SymbolView name={icon} tintColor={theme.textTertiary} size={18} />
          </View>
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
            icon ? styles.inputWithIcon : undefined,
            style,
          ]}
          {...rest}
        />
      </View>
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
  inputWrap: { justifyContent: 'center' },
  icon: { position: 'absolute', left: Spacing.three, zIndex: 1 },
  input: {
    minHeight: MinTouchTarget,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  inputWithIcon: { paddingLeft: Spacing.three + 22 + Spacing.one },
});
