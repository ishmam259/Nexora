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
import { getMyLaundryOrders, LaundryOrderStatus } from '@/services/api/laundry';
import { formatDateTime, formatMoney } from '@/utils/format';

const STEP_LABELS = ['Booked', 'Received', 'Washing', 'Drying', 'Ready for pickup'];

function stepsForStatus(status: LaundryOrderStatus): TimelineStep[] {
  if (status === 'CANCELLED') {
    return [{ label: 'Booked', state: 'done' }, { label: 'Cancelled', state: 'current' }];
  }
  const order: LaundryOrderStatus[] = ['PENDING', 'RECEIVED', 'WASHING', 'DRYING', 'READY_FOR_PICKUP', 'COMPLETED'];
  const currentIndex = order.indexOf(status);
  return STEP_LABELS.map((label, i) => ({
    label,
    state: i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming',
  }));
}

export default function LaundryOrdersScreen() {
  const { data, loading, error, refresh, refreshing } = useAsync(() => getMyLaundryOrders(), []);

  if (loading) return <LoadingView />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <>
      <Stack.Screen options={{ title: 'My Laundry Orders' }} />
      <FlatList
        style={listContainerStyle}
        contentContainerStyle={listContentStyle()}
        data={data ?? []}
        keyExtractor={(item) => String(item.id)}
        onRefresh={refresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <EmptyState
            icon={{ ios: 'washer', android: 'local_laundry_service', web: 'local_laundry_service' }}
            title="No bookings yet"
            message="Book a wash slot and track your laundry here."
          />
        }
        renderItem={({ item }) => (
          <Card style={{ gap: Spacing.two }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedText type="smallBold">{item.slotLabel}</ThemedText>
              <ThemedText type="smallBold">{formatMoney(item.amount)}</ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {item.laundryType.replace(/_/g, ' ')} · {item.weightKg} kg
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
