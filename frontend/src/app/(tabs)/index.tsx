import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { SpringboardIcon } from '@/components/ui/springboard-icon';
import { TextField } from '@/components/ui/text-field';
import { MODULES } from '@/constants/modules';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { getMyFoodOrders } from '@/services/api/food';
import { getMyLaundryOrders } from '@/services/api/laundry';
import { getMyPrintOrders } from '@/services/api/print';
import { getMyWallet } from '@/services/api/wallet';
import { foodOrderProgress, laundryOrderProgress, printOrderProgress } from '@/utils/order-progress';
import { formatMoney } from '@/utils/format';

function greetingForHour(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const LAUNDRY_TYPE_LABELS: Record<string, string> = {
  WASH_AND_FOLD: 'Wash & fold',
  WASH_AND_IRON: 'Wash & iron',
  DRY_CLEAN: 'Dry clean',
  IRON_ONLY: 'Iron only',
};

type ActiveOrder = {
  key: string;
  title: string;
  meta: string;
  icon: Parameters<typeof SymbolView>[0]['name'];
  label: string;
  fraction: number;
  tone: 'accent' | 'ok' | 'neutral';
  createdAt: string;
};

function useActiveOrders() {
  const food = useAsync(() => getMyFoodOrders(), []);
  const laundry = useAsync(() => getMyLaundryOrders(), []);
  const print = useAsync(() => getMyPrintOrders(), []);

  const loading = food.loading || laundry.loading || print.loading;

  const orders = useMemo<ActiveOrder[]>(() => {
    const items: ActiveOrder[] = [];

    for (const o of food.data ?? []) {
      if (o.status === 'COMPLETED' || o.status === 'CANCELLED') continue;
      const p = foodOrderProgress(o.status);
      items.push({
        key: `food-${o.id}`,
        title: o.restaurantName,
        meta: `${o.items.length} item${o.items.length === 1 ? '' : 's'} · to your address`,
        icon: { ios: 'fork.knife', android: 'restaurant', web: 'restaurant' },
        label: p.label,
        fraction: p.fraction,
        tone: p.tone,
        createdAt: o.createdAt,
      });
    }
    for (const o of laundry.data ?? []) {
      if (o.status === 'COMPLETED' || o.status === 'CANCELLED') continue;
      const p = laundryOrderProgress(o.status);
      items.push({
        key: `laundry-${o.id}`,
        title: `${LAUNDRY_TYPE_LABELS[o.laundryType] ?? o.laundryType} · ${o.weightKg} kg`,
        meta: o.slotLabel,
        icon: { ios: 'washer', android: 'local_laundry_service', web: 'local_laundry_service' },
        label: p.label,
        fraction: p.fraction,
        tone: p.tone,
        createdAt: o.createdAt,
      });
    }
    for (const o of print.data ?? []) {
      if (o.status === 'COMPLETED' || o.status === 'CANCELLED') continue;
      const p = printOrderProgress(o.status);
      items.push({
        key: `print-${o.id}`,
        title: o.fileName,
        meta: 'Print desk, Library',
        icon: { ios: 'printer', android: 'print', web: 'print' },
        label: p.label,
        fraction: p.fraction,
        tone: p.tone,
        createdAt: o.createdAt,
      });
    }

    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);
  }, [food.data, laundry.data, print.data]);

  return { orders, loading };
}

export default function HomeScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const { data: wallet, loading: walletLoading, error: walletError, refresh: refreshWallet } = useAsync(
    () => getMyWallet(),
    []
  );
  const { orders: activeOrders, loading: ordersLoading } = useActiveOrders();
  const [search, setSearch] = useState('');

  const firstName = user?.name?.split(' ')[0] ?? user?.username ?? 'there';
  const initial = (user?.name ?? user?.username ?? '?').charAt(0).toUpperCase();
  const greeting = greetingForHour(new Date().getHours());

  const balanceLabel = wallet
    ? formatMoney(wallet.balance, wallet.currency)
    : walletError
      ? 'Wallet'
      : null;

  const toneColor = (tone: 'accent' | 'ok' | 'neutral') =>
    tone === 'accent' ? theme.primary : tone === 'ok' ? theme.success : theme.textSecondary;
  const toneBg = (tone: 'accent' | 'ok' | 'neutral') =>
    tone === 'accent' ? theme.primaryMuted : tone === 'ok' ? theme.successMuted : theme.backgroundSelected;

  return (
    <Screen tabInset>
      <View style={styles.topBar}>
        <View style={[styles.avatar, { backgroundColor: theme.primaryMuted }]}>
          <ThemedText style={{ color: theme.primary, fontWeight: '600', fontSize: 15 }}>{initial}</ThemedText>
        </View>
        <View style={styles.greetingBlock}>
          <ThemedText type="caption" themeColor="textSecondary">
            {greeting}
          </ThemedText>
          <ThemedText type="subtitle" numberOfLines={1}>
            {firstName}
          </ThemedText>
        </View>

        <Pressable onPress={() => router.push('/notifications')} accessibilityRole="button" accessibilityLabel="Notifications" style={styles.bellButton}>
          <SymbolView name={{ ios: 'bell', android: 'notifications', web: 'notifications' }} tintColor={theme.textSecondary} size={18} />
        </Pressable>

        <Pressable
          onPress={() => (walletError ? refreshWallet() : router.push('/wallet'))}
          accessibilityRole="button"
          accessibilityLabel={
            wallet
              ? `Wallet balance ${formatMoney(wallet.balance, wallet.currency)}`
              : walletError
                ? 'Wallet unavailable. Tap to retry.'
                : 'Loading wallet balance'
          }
          style={({ pressed }) => [
            styles.walletChip,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
              opacity: pressed ? 0.88 : 1,
            },
          ]}
        >
          <SymbolView
            name={{ ios: 'wallet.pass.fill', android: 'account_balance_wallet', web: 'account_balance_wallet' }}
            tintColor={theme.text}
            size={15}
          />
          {walletLoading && !wallet ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <ThemedText type="smallBold" numberOfLines={1}>
              {balanceLabel ?? '—'}
            </ThemedText>
          )}
        </Pressable>
      </View>

      <TextField
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={() => search.trim() && router.push({ pathname: '/marketplace', params: { search: search.trim() } })}
        placeholder="Search food, listings, services…"
        icon={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
        returnKeyType="search"
      />

      <SectionHeader title="Services" />
      <View style={styles.grid} accessibilityRole="summary" accessibilityLabel="Campus services">
        {MODULES.map((item) => (
          <SpringboardIcon key={item.key} label={item.label} moduleKey={item.key} onPress={() => router.push(item.href)} />
        ))}
      </View>

      <SectionHeader title="Active orders" actionLabel={activeOrders.length > 0 ? 'All orders' : undefined} onAction={() => router.push('/food/orders')} />
      {!ordersLoading && activeOrders.length === 0 ? (
        <ThemedText type="small" themeColor="textTertiary">
          Nothing in progress right now.
        </ThemedText>
      ) : (
        <Card style={{ padding: 0 }}>
          {activeOrders.map((order, index) => (
            <View
              key={order.key}
              style={[styles.orderRow, index > 0 && { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}
            >
              <View style={[styles.orderIcon, { backgroundColor: theme.backgroundSelected }]}>
                <SymbolView name={order.icon} tintColor={theme.text} size={17} />
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <View style={styles.orderHeadline}>
                  <ThemedText type="small" style={{ fontWeight: '500', flex: 1 }} numberOfLines={1}>
                    {order.title}
                  </ThemedText>
                  <View style={[styles.tag, { backgroundColor: toneBg(order.tone) }]}>
                    <ThemedText type="caption" style={{ color: toneColor(order.tone), fontWeight: '600' }}>
                      {order.label}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
                  {order.meta}
                </ThemedText>
                <View style={[styles.progressTrack, { backgroundColor: theme.borderSubtle }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.round(order.fraction * 100)}%`, backgroundColor: order.tone === 'ok' ? theme.success : theme.primary },
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingBlock: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    gap: 2,
  },
  bellButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletChip: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: Spacing.one,
    height: 36,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.one,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    padding: Spacing.three,
    minHeight: 60,
  },
  orderIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderHeadline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  tag: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2 },
});
