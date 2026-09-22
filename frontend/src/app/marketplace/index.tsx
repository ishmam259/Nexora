import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { ChipRow } from '@/components/ui/chip-row';
import { EmptyState, ErrorState, LoadingView } from '@/components/ui/feedback-states';
import { listContainerStyle, listContentStyle } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Radius, Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { getCategories, getProducts, listingPrice, ProductCondition, ProductResponseDto } from '@/services/api/marketplace';
import { formatMoney } from '@/utils/format';
import { resolveMediaUrl } from '@/utils/media';

const CONDITION_LABELS: Record<ProductCondition, string> = {
  NEW: 'New',
  LIKE_NEW: 'Like new',
  GOOD: 'Used',
  FAIR: 'Used',
  POOR: 'Well used',
};

export default function MarketplaceScreen() {
  const theme = useTheme();
  const { search: initialSearch } = useLocalSearchParams<{ search?: string }>();
  const [search, setSearch] = useState(initialSearch ?? '');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const { data: categories } = useAsync(() => getCategories(), []);
  const {
    data: products,
    loading,
    error,
    refresh,
    refreshing,
  } = useAsync(() => getProducts({ search: search || undefined, categoryId: categoryId ?? undefined }), [search, categoryId]);

  const chips = useMemo(() => [{ id: null, name: 'All' }, ...((categories ?? []).map((c) => ({ id: c.id, name: c.name })))], [
    categories,
  ]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Marketplace',
          headerRight: () => (
            <View style={styles.headerActions}>
              <Pressable onPress={() => router.push('/marketplace/orders')} hitSlop={8} accessibilityLabel="Auction activity">
                <SymbolView name={{ ios: 'clock.arrow.circlepath', android: 'history', web: 'history' }} tintColor={theme.textSecondary} size={19} />
              </Pressable>
              <Pressable
                onPress={() => router.push('/marketplace/new')}
                accessibilityRole="button"
                accessibilityLabel="List for auction"
                style={[styles.sellPill, { backgroundColor: theme.primaryMuted }]}
              >
                <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} tintColor={theme.primary} size={15} />
                <ThemedText type="smallBold" style={{ color: theme.primary }}>
                  Sell
                </ThemedText>
              </Pressable>
            </View>
          ),
        }}
      />
      <View style={styles.searchWrap}>
        <View style={listContainerStyle}>
          <TextField
            value={search}
            onChangeText={setSearch}
            placeholder="Search listings"
            icon={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
          />
          <View style={styles.chipRow}>
            <ChipRow options={chips.map((c) => ({ id: c.id, label: c.name }))} value={categoryId} onChange={setCategoryId} />
          </View>
        </View>
      </View>

      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <FlatList
          style={listContainerStyle}
          contentContainerStyle={listContentStyle()}
          data={products ?? []}
          keyExtractor={(item) => String(item.id)}
          onRefresh={refresh}
          refreshing={refreshing}
          numColumns={2}
          columnWrapperStyle={{ gap: Spacing.two }}
          ListEmptyComponent={
            <EmptyState
              icon={{ ios: 'bag', android: 'shopping_bag', web: 'shopping_bag' }}
              title="No auctions yet"
              message="List something for auction — tap Sell above."
            />
          }
          renderItem={({ item }) => <ProductCard product={item} />}
        />
      )}
    </>
  );
}

function ProductCard({ product }: { product: ProductResponseDto }) {
  const theme = useTheme();
  const price = listingPrice(product);
  const bidLabel = product.bidCount === 1 ? '1 bid' : `${product.bidCount} bids`;
  const meta = `${CONDITION_LABELS[product.condition]} · ${bidLabel}`;
  const imageUri = resolveMediaUrl(product.imageUrl);

  return (
    <Pressable
      style={styles.cardWrap}
      onPress={() => router.push(`/marketplace/${product.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, ${formatMoney(price)}, ${bidLabel}`}
    >
      <Card style={styles.card}>
        <View style={[styles.thumb, { backgroundColor: theme.thumb }]}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
          ) : (
            <SymbolView name={{ ios: 'shippingbox', android: 'inventory_2', web: 'inventory_2' }} tintColor={theme.textTertiary} size={28} />
          )}
          {!product.biddingOpen && (
            <View style={[styles.endedBadge, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="caption" themeColor="textSecondary">
                {product.status === 'SOLD' ? 'Sold' : 'Ended'}
              </ThemedText>
            </View>
          )}
        </View>
        <View style={styles.cardBody}>
          <ThemedText type="small" style={{ fontWeight: '500' }} numberOfLines={2}>
            {product.title}
          </ThemedText>
          <ThemedText type="caption" themeColor="textSecondary" style={styles.bidLabel}>
            {product.currentBid != null ? 'Current bid' : 'Starting bid'}
          </ThemedText>
          <ThemedText type="smallBold">{formatMoney(price)}</ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            {meta}
          </ThemedText>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginRight: Spacing.one },
  sellPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 30,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.full,
  },
  searchWrap: { alignItems: 'center', paddingHorizontal: Spacing.four, paddingTop: Spacing.two, gap: Spacing.two },
  chipRow: { marginTop: Spacing.one },
  cardWrap: { flex: 1 },
  card: { gap: 0, padding: Spacing.two },
  thumb: {
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  image: { width: '100%', height: '100%' },
  endedBadge: {
    position: 'absolute',
    top: Spacing.one,
    right: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  cardBody: {
    paddingHorizontal: Spacing.one,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
    gap: 3,
  },
  bidLabel: { fontSize: 11 },
});
