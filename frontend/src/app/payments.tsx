import { useState } from 'react';
import { FlatList, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState, ErrorState, LoadingView } from '@/components/ui/feedback-states';
import { listContainerStyle, listContentStyle } from '@/components/ui/screen';
import { StatusBadge } from '@/components/ui/status-badge';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { getMyPaymentsPaged, PaymentResponseDto } from '@/services/api/payment';
import { formatDateTime, formatMoney } from '@/utils/format';

export default function PaymentsScreen() {
  const [items, setItems] = useState<PaymentResponseDto[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { loading, error, refresh, refreshing } = useAsync(async () => {
    const result = await getMyPaymentsPaged(0, 20);
    setItems(result.content);
    setPage(0);
    setHasMore(!result.last);
    return result;
  }, []);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const result = await getMyPaymentsPaged(next, 20);
      setItems((prev) => [...prev, ...result.content]);
      setPage(next);
      setHasMore(!result.last);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) return <LoadingView />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <FlatList
      style={listContainerStyle}
      contentContainerStyle={listContentStyle()}
      data={items}
      keyExtractor={(item) => String(item.id)}
      onRefresh={refresh}
      refreshing={refreshing}
      onEndReachedThreshold={0.3}
      onEndReached={loadMore}
      ListEmptyComponent={
        <EmptyState
          icon={{ ios: 'receipt', android: 'receipt_long', web: 'receipt_long' }}
          title="No payments yet"
          message="Charges you make across Marketplace, Food, Laundry, Print, and Medical will show up here."
        />
      }
      ListFooterComponent={loadingMore ? <Button label="Loading…" variant="ghost" onPress={() => {}} loading /> : null}
      renderItem={({ item }) => (
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <ThemedText type="smallBold">{item.orderId}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {item.paymentMethod.replace('_', ' ')} · {item.transactionId}
              </ThemedText>
            </View>
            <ThemedText type="smallBold">{formatMoney(item.amount, item.currency)}</ThemedText>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.one }}>
            <StatusBadge status={item.status} />
            <ThemedText type="small" themeColor="textSecondary">
              {formatDateTime(item.createdAt)}
            </ThemedText>
          </View>
        </Card>
      )}
    />
  );
}
