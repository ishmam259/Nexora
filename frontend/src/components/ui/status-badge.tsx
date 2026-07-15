import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { humanizeStatus } from '@/utils/format';

const SUCCESS_STATUSES = new Set([
  'COMPLETED',
  'CONFIRMED',
  'SUCCESS',
  'SENT',
  'RESOLVED',
  'READY_FOR_PICKUP',
  'ACTIVE',
]);
const DANGER_STATUSES = new Set(['CANCELLED', 'FAILED', 'REMOVED', 'SOLD']);

export function StatusBadge({ status }: { status: string }) {
  const theme = useTheme();

  const color = SUCCESS_STATUSES.has(status) ? theme.success : DANGER_STATUSES.has(status) ? theme.danger : theme.warning;

  return (
    <View style={[styles.badge, { backgroundColor: color + '26' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <ThemedText type="small" style={{ color, fontWeight: '700' }}>
        {humanizeStatus(status)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.five,
    gap: Spacing.one,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
