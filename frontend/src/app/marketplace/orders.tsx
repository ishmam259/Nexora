import { Stack } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { EmptyState, ErrorState, LoadingView } from '@/components/ui/feedback-states';
import { listContainerStyle, listContentStyle } from '@/components/ui/screen';
import { StatusBadge } from '@/components/ui/status-badge';
import { MODULES } from '@/constants/modules';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { getMyPurchases, getMySales, OrderResponseDto } from '@/services/api/marketplace';
import { formatDateTime, formatMoney } from '@/utils/format';

const ACCENT = MODULES.find((m) => m.key === 'marketplace')!.color;

export default function MarketplaceOrdersScreen() {
  const theme = useTheme();
  const [tab, setTab] = useState<'purchases' | 'sales'>('purchases');

  const { data, loading, error, refresh, refreshing } = useAsync(
    () => (tab === 'purchases' ? getMyPurchases() : getMySales()),
    [tab]
  );

  return (
    <>
      <Stack.Screen options={{ title: 'My Orders' }} />
      <View style={[listContainerStyle, { alignSelf: 'center', paddingHorizontal: Spacing.four, paddingTop: Spacing.three }]}>
        <View style={{ flexDirection: 'row', gap: Spacing.two }}>
          {(['purchases', 'sales'] as const).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={{ flex: 1 }}>
              <View
                style={{
                  paddingVertical: Spacing.two,
                  borderRadius: Spacing.two,
                  alignItems: 'center',
                  backgroundColor: tab === t ? ACCENT : theme.backgroundElement,
                }}
              >
                <ThemedText style={{ color: tab === t ? '#fff' : theme.text, fontWeight: '600' }}>
                  {t === 'purchases' ? 'Purchases' : 'Sales'}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <FlatList<OrderResponseDto>
          style={listContainerStyle}
          contentContainerStyle={listContentStyle()}
          data={data ?? []}
          keyExtractor={(item) => String(item.id)}
          onRefresh={refresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <EmptyState
              icon={{ ios: 'bag', android: 'shopping_bag', web: 'shopping_bag' }}
              title={tab === 'purchases' ? "You haven't bought anything yet" : "You haven't sold anything yet"}
              message={tab === 'purchases' ? 'Browse the marketplace to find what classmates are selling.' : 'List an item to start selling.'}
            />
          }
          renderItem={({ item }) => (
            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <ThemedText type="smallBold" style={{ flex: 1 }} numberOfLines={1}>
                  {item.productTitle}
                </ThemedText>
                <ThemedText type="smallBold">{formatMoney(item.amount)}</ThemedText>
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                Qty {item.quantity} · {tab === 'purchases' ? `Seller ${item.sellerId}` : `Buyer ${item.buyerId}`}
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
      )}
    </>
  );
}
