import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorState, LoadingView } from '@/components/ui/feedback-states';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { MODULES } from '@/constants/modules';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { createFoodOrder, getMenu, getRestaurant } from '@/services/api/food';
import { payWithWallet } from '@/services/api/payment';
import { formatMoney } from '@/utils/format';

const ACCENT = MODULES.find((m) => m.key === 'food')!.color;

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const restaurantId = Number(id);
  const theme = useTheme();

  const { data: restaurant, loading: rLoading, error: rError, refresh: refreshR } = useAsync(() => getRestaurant(restaurantId), [restaurantId]);
  const { data: menu, loading: mLoading, error: mError, refresh: refreshM } = useAsync(() => getMenu(restaurantId), [restaurantId]);

  const [cart, setCart] = useState<Record<number, number>>({});
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [note, setNote] = useState('');
  const [placing, setPlacing] = useState(false);

  const items = useMemo(() => Object.entries(cart).filter(([, qty]) => qty > 0), [cart]);
  const total = useMemo(
    () => items.reduce((sum, [menuItemId, qty]) => sum + qty * (menu?.find((m) => m.id === Number(menuItemId))?.price ?? 0), 0),
    [items, menu]
  );

  const setQty = (menuItemId: number, qty: number) => setCart((prev) => ({ ...prev, [menuItemId]: Math.max(0, qty) }));

  if (rLoading || mLoading) return <LoadingView />;
  if (rError || !restaurant) return <ErrorState message={rError ?? 'Restaurant not found.'} onRetry={refreshR} />;

  const placeOrder = async () => {
    if (items.length === 0) return;
    if (!deliveryAddress.trim()) {
      Alert.alert('Delivery address required', 'Let the restaurant know where to send your order.');
      return;
    }
    setPlacing(true);
    try {
      const payment = await payWithWallet(`food:${restaurant.id}`, total, restaurant.name);
      await createFoodOrder({
        restaurantId: restaurant.id,
        items: items.map(([menuItemId, quantity]) => ({ menuItemId: Number(menuItemId), quantity })),
        paymentReference: payment.transactionId,
        deliveryAddress: deliveryAddress.trim(),
        customerNote: note.trim(),
      });
      if (Platform.OS === 'web') {
        router.push('/food/orders');
      } else {
        Alert.alert('Order placed', `Your order from ${restaurant.name} is on its way to being confirmed.`, [
          { text: 'View orders', onPress: () => router.push('/food/orders') },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Order failed', err?.message ?? 'Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Screen tabInset>
      <Stack.Screen options={{ title: restaurant.name }} />
      <View>
        <ThemedText type="subtitle">{restaurant.name}</ThemedText>
        <ThemedText themeColor="textSecondary" type="small">
          {restaurant.address}
        </ThemedText>
      </View>

      {mError ? (
        <ErrorState message={mError} onRetry={refreshM} />
      ) : (
        (menu ?? []).map((item) => (
          <Card key={item.id} style={styles.menuRow}>
            <View style={{ flex: 1 }}>
              <ThemedText type="smallBold">{item.name}</ThemedText>
              {!!item.description && (
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
                  {item.description}
                </ThemedText>
              )}
              <ThemedText type="small" style={{ color: ACCENT, fontWeight: '700', marginTop: Spacing.half }}>
                {formatMoney(item.price)}
              </ThemedText>
            </View>
            {item.available ? (
              <View style={styles.stepper}>
                <Pressable onPress={() => setQty(item.id, (cart[item.id] ?? 0) - 1)} style={styles.stepButton}>
                  <SymbolView name={{ ios: 'minus', android: 'remove', web: 'remove' }} tintColor={theme.text} size={14} />
                </Pressable>
                <ThemedText type="smallBold">{cart[item.id] ?? 0}</ThemedText>
                <Pressable onPress={() => setQty(item.id, (cart[item.id] ?? 0) + 1)} style={styles.stepButton}>
                  <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} tintColor={theme.text} size={14} />
                </Pressable>
              </View>
            ) : (
              <ThemedText type="small" themeColor="textSecondary">
                Sold out
              </ThemedText>
            )}
          </Card>
        ))
      )}

      {items.length > 0 && (
        <Card style={{ gap: Spacing.two }}>
          <ThemedText type="smallBold">Checkout</ThemedText>
          <TextField label="Delivery address" value={deliveryAddress} onChangeText={setDeliveryAddress} placeholder="Hostel, room number…" />
          <TextField label="Note (optional)" value={note} onChangeText={setNote} placeholder="No onions, extra spicy…" />
          <Button label={`Pay ${formatMoney(total)} & order`} onPress={placeOrder} loading={placing} />
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  stepButton: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(128,128,128,0.15)' },
});
