import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { CartBar } from '@/components/ui/cart-bar';
import { Card } from '@/components/ui/card';
import { ErrorState, LoadingView } from '@/components/ui/feedback-states';
import { Screen } from '@/components/ui/screen';
import { Tabs } from '@/components/ui/tabs';
import { TextField } from '@/components/ui/text-field';
import { Radius, Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { createFoodOrder, getMenu, getRestaurant } from '@/services/api/food';
import { payWithWallet } from '@/services/api/payment';
import { formatMoney } from '@/utils/format';

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const restaurantId = Number(id);
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const { data: restaurant, loading: rLoading, error: rError, refresh: refreshR } = useAsync(() => getRestaurant(restaurantId), [restaurantId]);
  const { data: menu, loading: mLoading, error: mError, refresh: refreshM } = useAsync(() => getMenu(restaurantId), [restaurantId]);

  const [category, setCategory] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  const [cart, setCart] = useState<Record<number, number>>({});
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [note, setNote] = useState('');
  const [placing, setPlacing] = useState(false);

  const categories = useMemo(() => {
    const unique = Array.from(new Set((menu ?? []).map((m) => m.category).filter(Boolean)));
    return [{ id: null, label: 'Popular' }, ...unique.map((c) => ({ id: c, label: c }))];
  }, [menu]);

  const visibleMenu = useMemo(
    () =>
      (menu ?? [])
        .filter((item) => !category || item.category === category)
        .filter((item) => !menuSearch.trim() || item.name.toLowerCase().includes(menuSearch.trim().toLowerCase())),
    [menu, category, menuSearch]
  );

  const items = useMemo(() => Object.entries(cart).filter(([, qty]) => qty > 0), [cart]);
  const itemCount = items.reduce((sum, [, qty]) => sum + qty, 0);
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
    <View style={{ flex: 1 }}>
      <Screen tabInset={itemCount === 0} padded={false}>
        <Stack.Screen options={{ headerShown: false }} />

        <View style={[styles.imageWrap, { backgroundColor: theme.tile }]}>
          {!!restaurant.imageUrl && <Image source={{ uri: restaurant.imageUrl }} style={styles.image} contentFit="cover" />}

          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={[styles.overButton, { top: insets.top + 8, left: 16, backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
          >
            <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} tintColor={theme.text} size={19} />
          </Pressable>
          <Pressable
            onPress={() => setSearchOpen((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel="Search menu"
            style={[styles.overButton, { top: insets.top + 8, right: 16, backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
          >
            <SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} tintColor={theme.text} size={19} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={{ gap: 4 }}>
            <ThemedText style={styles.name}>{restaurant.name}</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">
              {restaurant.address}
            </ThemedText>
          </View>

          {searchOpen && (
            <TextField
              value={menuSearch}
              onChangeText={setMenuSearch}
              placeholder="Search menu"
              icon={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
              autoFocus
            />
          )}

          {categories.length > 1 && <Tabs options={categories} value={category} onChange={setCategory} />}

          {mError ? (
            <ErrorState message={mError} onRetry={refreshM} />
          ) : (
            <View>
              {visibleMenu.map((item, index) => (
                <View
                  key={item.id}
                  style={[styles.menuRow, index > 0 && { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}
                >
                  <View style={{ flex: 1, gap: 4 }}>
                    <ThemedText type="small" style={{ fontWeight: '600' }}>
                      {item.name}
                    </ThemedText>
                    {!!item.description && (
                      <ThemedText type="caption" themeColor="textSecondary" numberOfLines={2}>
                        {item.description}
                      </ThemedText>
                    )}
                    <ThemedText type="smallBold" style={{ marginTop: 2 }}>
                      {formatMoney(item.price)}
                    </ThemedText>
                  </View>

                  <View style={styles.thumbWrap}>
                    <View style={[styles.thumb, { backgroundColor: theme.tile, opacity: item.available ? 1 : 0.55 }]}>
                      {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" />
                      ) : (
                        <ThemedText type="caption" themeColor="textTertiary">
                          {item.name.charAt(0)}
                        </ThemedText>
                      )}
                    </View>
                    {item.available ? (
                      <Pressable
                        onPress={() => setQty(item.id, (cart[item.id] ?? 0) + 1)}
                        accessibilityRole="button"
                        accessibilityLabel={`Add ${item.name}`}
                        style={[styles.addBtn, { backgroundColor: theme.primary, borderColor: theme.background }]}
                      >
                        <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} tintColor={theme.onPrimary} size={15} />
                      </Pressable>
                    ) : (
                      <View style={[styles.soldOutTag, { backgroundColor: theme.backgroundSelected }]}>
                        <ThemedText type="caption" themeColor="textSecondary" style={{ fontWeight: '600' }}>
                          Sold out
                        </ThemedText>
                      </View>
                    )}
                    {(cart[item.id] ?? 0) > 0 && (
                      <View style={[styles.qtyBadge, { backgroundColor: theme.text, borderColor: theme.background }]}>
                        <ThemedText type="caption" style={{ color: theme.background, fontWeight: '700' }}>
                          {cart[item.id]}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {itemCount > 0 && (
            <Card style={{ gap: Spacing.two, marginTop: Spacing.three }}>
              <ThemedText type="smallBold">Delivery details</ThemedText>
              <TextField
                label="Deliver to"
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                placeholder="Hostel, room number…"
                icon={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }}
              />
              <TextField label="Note for the kitchen (optional)" value={note} onChangeText={setNote} placeholder="No onions, extra spicy…" />
            </Card>
          )}
        </View>
      </Screen>

      {itemCount > 0 && (
        <CartBar count={itemCount} label="Place order" amount={formatMoney(total)} onPress={placeOrder} loading={placing} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  imageWrap: { height: 220, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  overButton: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: Spacing.four, paddingTop: Spacing.four, gap: Spacing.three },
  name: { fontSize: 22, fontWeight: '600', letterSpacing: -0.2 },
  menuRow: { flexDirection: 'row', gap: Spacing.three, paddingVertical: Spacing.three },
  thumbWrap: { width: 88, height: 88, flexShrink: 0 },
  thumb: {
    width: 88,
    height: 88,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  addBtn: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOutTag: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: -8,
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  qtyBadge: {
    position: 'absolute',
    left: -6,
    top: -6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
});
