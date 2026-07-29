import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { EmptyState, ErrorState, LoadingView } from '@/components/ui/feedback-states';
import { listContainerStyle, listContentStyle } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { MODULES } from '@/constants/modules';
import { Radius, Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { getCategories, getProducts, listingPrice, ProductResponseDto } from '@/services/api/marketplace';
import { formatMoney } from '@/utils/format';
import { resolveMediaUrl } from '@/utils/media';

const ACCENT = MODULES.find((m) => m.key === 'marketplace')!.color;

export default function MarketplaceScreen() {
  const theme = useTheme();
  const [search, setSearch] = useState('');
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
          title: 'Auctions',
          headerRight: () => (
            <View style={styles.headerActions}>
              <Pressable onPress={() => router.push('/marketplace/orders')} hitSlop={8} accessibilityLabel="Auction activity">
                <SymbolView name={{ ios: 'clock.arrow.circlepath', android: 'history', web: 'history' }} tintColor={ACCENT} size={20} />
              </Pressable>
              <Pressable onPress={() => router.push('/marketplace/new')} hitSlop={8} accessibilityLabel="List for auction">
                <SymbolView name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' }} tintColor={ACCENT} size={22} />
              </Pressable>
            </View>
          ),
        }}
      />
      <View style={styles.searchWrap}>
        <View style={listContainerStyle}>
          <TextField value={search} onChangeText={setSearch} placeholder="Search auctions…" />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={chips}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.chipRow}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setCategoryId(item.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: categoryId === item.id }}
              >
                <View
                  style={[
                    styles.chip,
                    {
                      backgroundColor: categoryId === item.id ? ACCENT : theme.backgroundElement,
                      borderColor: categoryId === item.id ? ACCENT : theme.borderSubtle,
                    },
                  ]}
                >
                  <ThemedText
                    type="caption"
                    style={{
                      color: categoryId === item.id ? '#FFFFFF' : theme.textSecondary,
                      fontWeight: categoryId === item.id ? '600' : '500',
                    }}
                  >
                    {item.name}
                  </ThemedText>
                </View>
              </Pressable>
            )}
          />
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
              message="List something for auction — tap the + button above."
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
  const imageUri = resolveMediaUrl(product.imageUrl);

  return (
    <Pressable
      style={styles.cardWrap}
      onPress={() => router.push(`/marketplace/${product.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, ${formatMoney(price)}, ${bidLabel}`}
    >
      <Card style={styles.card}>
        <View style={[styles.imageWrap, { backgroundColor: theme.backgroundSelected }]}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
          ) : (
            <SymbolView name={{ ios: 'photo', android: 'image', web: 'image' }} tintColor={theme.textTertiary} size={28} />
          )}
          {!product.biddingOpen && (
            <View style={[styles.endedBadge, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="caption" themeColor="textSecondary">
                {product.status === 'SOLD' ? 'Sold' : 'Ended'}
              </ThemedText>
            </View>
          )}
        </View>
        <ThemedText type="smallBold" numberOfLines={2}>
          {product.title}
        </ThemedText>
        <ThemedText type="caption" themeColor="textSecondary">
          {product.currentBid != null ? 'Current bid' : 'Starting bid'}
        </ThemedText>
        <View style={styles.cardFooter}>
          <ThemedText type="smallBold" style={{ color: ACCENT }}>
            {formatMoney(price)}
          </ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            {bidLabel}
          </ThemedText>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: 'row', gap: Spacing.three, marginRight: Spacing.one },
  searchWrap: { alignItems: 'center', paddingHorizontal: Spacing.four, paddingTop: Spacing.two, gap: Spacing.two },
  chipRow: { gap: Spacing.two, paddingVertical: Spacing.two },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  cardWrap: { flex: 1 },
  card: { gap: Spacing.one, padding: Spacing.two },
  imageWrap: {
    aspectRatio: 1,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
