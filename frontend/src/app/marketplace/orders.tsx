import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState, ErrorState, LoadingView } from '@/components/ui/feedback-states';
import { listContainerStyle, listContentStyle } from '@/components/ui/screen';
import { StatusBadge } from '@/components/ui/status-badge';
import { MODULES } from '@/constants/modules';
import { Radius, Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import {
  cancelOrder,
  completeOrder,
  getMyPurchases,
  getMySales,
  OrderResponseDto,
  payOrder,
} from '@/services/api/marketplace';
import { payWithWallet } from '@/services/api/payment';
import { formatDateTime, formatMoney } from '@/utils/format';

const ACCENT = MODULES.find((m) => m.key === 'marketplace')!.color;

type Tab = 'won' | 'sold';

export default function MarketplaceOrdersScreen() {
  const theme = useTheme();
  const [tab, setTab] = useState<Tab>('won');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const purchases = useAsync(() => getMyPurchases(), []);
  const sales = useAsync(() => getMySales(), []);

  const active = tab === 'won' ? purchases : sales;
  const refreshAll = () => {
    purchases.refresh();
    sales.refresh();
  };

  const pay = async (order: OrderResponseDto) => {
    setBusyId(order.id);
    setActionError(null);
    try {
      const payment = await payWithWallet(`marketplace-order:${order.id}`, order.amount, order.productTitle);
      await payOrder(order.id, payment.transactionId);
      refreshAll();
    } catch (err: any) {
      setActionError(err?.message ?? 'Payment failed');
    } finally {
      setBusyId(null);
    }
  };

  const complete = async (order: OrderResponseDto) => {
    setBusyId(order.id);
    setActionError(null);
    try {
      await completeOrder(order.id);
      refreshAll();
    } catch (err: any) {
      setActionError(err?.message ?? 'Could not complete order');
    } finally {
      setBusyId(null);
    }
  };

  const cancel = async (order: OrderResponseDto) => {
    setBusyId(order.id);
    setActionError(null);
    try {
      await cancelOrder(order.id);
      refreshAll();
    } catch (err: any) {
      setActionError(err?.message ?? 'Could not cancel order');
    } finally {
      setBusyId(null);
    }
  };

  if (purchases.loading || sales.loading) return <LoadingView />;
  if (purchases.error && sales.error) {
    return <ErrorState message={purchases.error} onRetry={refreshAll} />;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Auction activity' }} />
      <View style={styles.tabs}>
        {([
          ['won', 'Won / to pay'],
          ['sold', 'Sold'],
        ] as const).map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => setTab(key)}
            style={[
              styles.tab,
              {
                backgroundColor: tab === key ? ACCENT : theme.backgroundElement,
                borderColor: tab === key ? ACCENT : theme.borderSubtle,
              },
            ]}
          >
            <ThemedText type="caption" style={{ color: tab === key ? '#FFF' : theme.textSecondary, fontWeight: '600' }}>
              {label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {actionError && (
        <ThemedText type="small" themeColor="danger" style={styles.error}>
          {actionError}
        </ThemedText>
      )}

      <FlatList
        style={listContainerStyle}
        contentContainerStyle={listContentStyle()}
        data={active.data ?? []}
        keyExtractor={(item) => String(item.id)}
        onRefresh={refreshAll}
        refreshing={!!active.refreshing}
        ListEmptyComponent={
          <EmptyState
            title={tab === 'won' ? 'No wins yet' : 'No sales yet'}
            message={
              tab === 'won'
                ? 'When a seller accepts your bid, it shows up here to pay.'
                : 'Accept a winning bid on your listing to create a sale.'
            }
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardTop}>
              <Pressable onPress={() => router.push(`/marketplace/${item.productId}`)} style={{ flex: 1 }}>
                <ThemedText type="smallBold">{item.productTitle}</ThemedText>
                <ThemedText type="caption" themeColor="textSecondary">
                  {formatDateTime(item.createdAt)}
                </ThemedText>
              </Pressable>
              <StatusBadge status={item.status} />
            </View>
            <ThemedText type="smallBold" style={{ color: ACCENT }}>
              {formatMoney(item.amount)}
            </ThemedText>
            <ThemedText type="caption" themeColor="textSecondary">
              {tab === 'won' ? `Seller @${item.sellerId}` : `Buyer @${item.buyerId}`}
            </ThemedText>

            <View style={styles.actions}>
              {tab === 'won' && item.status === 'AWAITING_PAYMENT' && (
                <Button label="Pay with wallet" onPress={() => pay(item)} loading={busyId === item.id} />
              )}
              {tab === 'sold' && item.status === 'PAID' && (
                <Button label="Mark completed" onPress={() => complete(item)} loading={busyId === item.id} />
              )}
              {(item.status === 'AWAITING_PAYMENT' || (tab === 'sold' && item.status === 'PAID')) && (
                <Button label="Cancel" variant="ghost" onPress={() => cancel(item)} disabled={busyId === item.id} />
              )}
            </View>
          </Card>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  error: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two },
  card: { gap: Spacing.two },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  actions: { gap: Spacing.two, marginTop: Spacing.one },
});
