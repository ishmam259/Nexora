import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
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
  'PAID',
]);
const DANGER_STATUSES = new Set(['CANCELLED', 'FAILED', 'REMOVED', 'SOLD']);
const WARNING_STATUSES = new Set(['AWAITING_PAYMENT', 'ENDED', 'PENDING']);

export function StatusBadge({ status }: { status: string }) {
  const theme = useTheme();

  const isSuccess = SUCCESS_STATUSES.has(status);
  const isDanger = DANGER_STATUSES.has(status);
  const isWarning = WARNING_STATUSES.has(status) || (!isSuccess && !isDanger);
  const color = isSuccess ? theme.success : isDanger ? theme.danger : theme.warning;
  const background = isSuccess ? theme.successMuted : isDanger ? theme.dangerMuted : theme.warningMuted;

  return (
    <View
      style={[styles.badge, { backgroundColor: background }]}
      accessibilityRole="text"
      accessibilityLabel={`Status: ${humanizeStatus(status)}`}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <ThemedText type="caption" style={{ color, fontWeight: '600' }}>
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
    paddingVertical: Spacing.one,
    borderRadius: Radius.full,
    gap: Spacing.one,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
