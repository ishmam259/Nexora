import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SymbolView, SymbolViewProps } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function LoadingView({ message = 'Loading…' }: { message?: string }) {
  const theme = useTheme();

  return (
    <View style={styles.center} accessibilityRole="progressbar" accessibilityLabel={message}>
      <ActivityIndicator size="large" color={theme.primary} />
      <ThemedText type="small" themeColor="textSecondary">
        {message}
      </ThemedText>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const theme = useTheme();

  return (
    <View style={styles.center} accessibilityRole="alert">
      <View style={[styles.iconCircle, { backgroundColor: theme.dangerMuted }]}>
        <SymbolView
          name={{ ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }}
          tintColor={theme.danger}
          size={28}
        />
      </View>
      <ThemedText type="smallBold" style={styles.centerText}>
        Something went wrong
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
        {message}
      </ThemedText>
      {onRetry && <Button label="Try again" variant="secondary" onPress={onRetry} style={styles.retryButton} />}
    </View>
  );
}

export function EmptyState({
  title,
  message,
  icon,
}: {
  title: string;
  message?: string;
  icon?: SymbolViewProps['name'];
}) {
  const theme = useTheme();

  return (
    <View style={styles.center}>
      {icon && (
        <View style={[styles.iconCircle, { backgroundColor: theme.backgroundSelected }]}>
          <SymbolView name={icon} tintColor={theme.textSecondary} size={28} />
        </View>
      )}
      <ThemedText type="smallBold" style={styles.centerText}>
        {title}
      </ThemedText>
      {message && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
          {message}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.seven,
    paddingHorizontal: Spacing.five,
    gap: Spacing.two,
  },
  centerText: { textAlign: 'center', maxWidth: 280 },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  retryButton: { marginTop: Spacing.two, minWidth: 140 },
});
