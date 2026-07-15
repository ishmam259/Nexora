import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} hitSlop={8}>
          <ThemedText style={{ color: theme.primary, fontWeight: '600' }}>{actionLabel}</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 20 },
});
