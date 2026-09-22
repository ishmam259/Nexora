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
import { FoodOrderResponseDto, FoodOrderStatus, getMyFoodOrders } from '@/services/api/food';
import { formatDateTime, formatMoney } from '@/utils/format';

const STEP_LABELS = ['Order placed', 'Confirmed', 'Preparing', 'Out for delivery', 'Delivered'];

function stepsForStatus(status: FoodOrderStatus): TimelineStep[] {
  if (status === 'CANCELLED') {
    return [{ label: 'Order placed', state: 'done' }, { label: 'Cancelled', state: 'current' }];
  }
  const order: FoodOrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'COMPLETED'];
  const currentIndex = order.indexOf(status);
  return STEP_LABELS.map((label, i) => ({
    label,
    state: i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming',
  }));
}

export default function FoodOrdersScreen() {
  const { data, loading, error, refresh, refreshing } = useAsync(() => getMyFoodOrders(), []);

  if (loading) return <LoadingView />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <>
      <Stack.Screen options={{ title: 'My Food Orders' }} />
      <FlatList
        style={listContainerStyle}
        contentContainerStyle={listContentStyle()}
        data={data ?? []}
        keyExtractor={(item) => String(item.id)}
        onRefresh={refresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <EmptyState
            icon={{ ios: 'fork.knife', android: 'restaurant', web: 'restaurant' }}
            title="No orders yet"
            message="Order from a campus restaurant and track it here."
          />
        }
        renderItem={({ item }) => <FoodOrderCard order={item} />}
      />
    </>
  );
}

function FoodOrderCard({ order }: { order: FoodOrderResponseDto }) {
  const isActive = order.status !== 'COMPLETED' && order.status !== 'CANCELLED';

  return (
    <Card style={{ gap: Spacing.two }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <ThemedText type="smallBold">{order.restaurantName}</ThemedText>
        <ThemedText type="smallBold">{formatMoney(order.amount)}</ThemedText>
      </View>
      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
        {order.items.map((i) => `${i.quantity}× ${i.menuItemName}`).join(', ')}
      </ThemedText>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <StatusBadge status={order.status} />
        <ThemedText type="small" themeColor="textSecondary">
          {formatDateTime(order.createdAt)}
        </ThemedText>
      </View>
      {isActive && (
        <View style={{ marginTop: Spacing.one }}>
          <OrderTimeline steps={stepsForStatus(order.status)} />
        </View>
      )}
    </Card>
  );
}
