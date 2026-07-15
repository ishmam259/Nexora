import { Stack } from 'expo-router';
import { FlatList, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { EmptyState, ErrorState, LoadingView } from '@/components/ui/feedback-states';
import { listContainerStyle, listContentStyle } from '@/components/ui/screen';
import { StatusBadge } from '@/components/ui/status-badge';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { getMyFoodOrders } from '@/services/api/food';
import { formatDateTime, formatMoney } from '@/utils/format';

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
        renderItem={({ item }) => (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedText type="smallBold">{item.restaurantName}</ThemedText>
              <ThemedText type="smallBold">{formatMoney(item.amount)}</ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {item.items.map((i) => `${i.quantity}× ${i.menuItemName}`).join(', ')}
            </ThemedText>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.one }}>
              <StatusBadge status={item.status} />
              <ThemedText type="small" themeColor="textSecondary">
                {formatDateTime(item.createdAt)}
              </ThemedText>
            </View>
          </Card>
        )}
      />
    </>
  );
}
