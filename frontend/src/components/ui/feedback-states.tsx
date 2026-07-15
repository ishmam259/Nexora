import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SymbolView, SymbolViewProps } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function LoadingView() {
  const theme = useTheme();
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <ThemedText themeColor="danger" style={styles.centerText}>
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
      {icon && <SymbolView name={icon} tintColor={theme.textSecondary} size={40} style={styles.icon} />}
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.six, gap: Spacing.two },
  centerText: { textAlign: 'center' },
  icon: { marginBottom: Spacing.one },
  retryButton: { marginTop: Spacing.two, paddingHorizontal: Spacing.five },
});
