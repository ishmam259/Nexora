import { Stack } from 'expo-router';
import { FlatList, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { EmptyState, ErrorState, LoadingView } from '@/components/ui/feedback-states';
import { OrderTimeline, TimelineStep } from '@/components/ui/order-timeline';
import { listContainerStyle, listContentStyle } from '@/components/ui/screen';
import { StatusBadge } from '@/components/ui/status-badge';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { getMyPrintOrders, PrintOrderStatus } from '@/services/api/print';
import { formatDateTime, formatMoney } from '@/utils/format';

const STEP_LABELS = ['Queued', 'Printing', 'Ready for pickup'];

function stepsForStatus(status: PrintOrderStatus): TimelineStep[] {
  if (status === 'CANCELLED') {
    return [{ label: 'Queued', state: 'done' }, { label: 'Cancelled', state: 'current' }];
  }
  const order: PrintOrderStatus[] = ['PENDING', 'QUEUED', 'PRINTING', 'READY_FOR_PICKUP', 'COMPLETED'];
  const currentIndex = Math.max(0, order.indexOf(status) - 1);
  return STEP_LABELS.map((label, i) => ({
    label,
    state: status === 'COMPLETED' ? 'done' : i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming',
  }));
}

export default function PrintOrdersScreen() {
  const { data, loading, error, refresh, refreshing } = useAsync(() => getMyPrintOrders(), []);

  if (loading) return <LoadingView />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <>
      <Stack.Screen options={{ title: 'My Print Orders' }} />
      <FlatList
        style={listContainerStyle}
        contentContainerStyle={listContentStyle()}
        data={data ?? []}
        keyExtractor={(item) => String(item.id)}
        onRefresh={refresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <EmptyState
            icon={{ ios: 'printer', android: 'print', web: 'print' }}
            title="No print jobs yet"
            message="Send a document to the print desk and track it here."
          />
        }
        renderItem={({ item }) => (
          <Card style={{ gap: Spacing.two }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedText type="smallBold" numberOfLines={1} style={{ flex: 1 }}>
                {item.fileName}
              </ThemedText>
              <ThemedText type="smallBold">{formatMoney(item.amount)}</ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {item.pageCount} pages · {item.copies} {item.copies === 1 ? 'copy' : 'copies'} · {item.color ? 'Color' : 'B&W'}
              {item.doubleSided ? ' · Double-sided' : ''}
            </ThemedText>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <StatusBadge status={item.status} />
              <ThemedText type="small" themeColor="textSecondary">
                {formatDateTime(item.createdAt)}
              </ThemedText>
            </View>
            {item.status !== 'COMPLETED' && item.status !== 'CANCELLED' && (
              <View style={{ marginTop: Spacing.one }}>
                <OrderTimeline steps={stepsForStatus(item.status)} />
              </View>
            )}
          </Card>
        )}
      />
    </>
  );
}
