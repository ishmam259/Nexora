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
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { getCategories, getProducts, ProductResponseDto } from '@/services/api/marketplace';
import { formatMoney } from '@/utils/format';

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
          title: 'Marketplace',
          headerRight: () => (
            <View style={styles.headerActions}>
              <Pressable onPress={() => router.push('/marketplace/orders')} hitSlop={8}>
                <SymbolView name={{ ios: 'clock.arrow.circlepath', android: 'history', web: 'history' }} tintColor={ACCENT} size={20} />
              </Pressable>
              <Pressable onPress={() => router.push('/marketplace/new')} hitSlop={8}>
                <SymbolView name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' }} tintColor={ACCENT} size={22} />
              </Pressable>
            </View>
          ),
        }}
      />
      <View style={styles.searchWrap}>
        <View style={listContainerStyle}>
          <TextField value={search} onChangeText={setSearch} placeholder="Search listings…" />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={chips}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.chipRow}
            renderItem={({ item }) => (
              <Pressable onPress={() => setCategoryId(item.id)}>
                <View
                  style={[
                    styles.chip,
                    { backgroundColor: categoryId === item.id ? ACCENT : theme.backgroundElement },
                  ]}
                >
                  <ThemedText type="small" style={{ color: categoryId === item.id ? '#fff' : theme.text }}>
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
              title="No listings yet"
              message="Be the first to sell something on campus — tap the + button above."
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
  return (
    <Pressable style={styles.cardWrap} onPress={() => router.push(`/marketplace/${product.id}`)}>
      <Card style={styles.card}>
        <View style={[styles.imageWrap, { backgroundColor: theme.backgroundSelected }]}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.image} contentFit="cover" />
          ) : (
            <SymbolView name={{ ios: 'photo', android: 'image', web: 'image' }} tintColor={theme.textSecondary} size={28} />
          )}
        </View>
        <ThemedText type="smallBold" numberOfLines={1}>
          {product.title}
        </ThemedText>
        <View style={styles.cardFooter}>
          <ThemedText style={{ color: ACCENT, fontWeight: '700' }}>{formatMoney(product.price)}</ThemedText>
          {product.averageRating != null && (
            <View style={styles.ratingRow}>
              <SymbolView name={{ ios: 'star.fill', android: 'star', web: 'star' }} tintColor={theme.warning} size={12} />
              <ThemedText type="small" themeColor="textSecondary">
                {product.averageRating.toFixed(1)}
              </ThemedText>
            </View>
          )}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: 'row', gap: Spacing.three, marginRight: Spacing.one },
  searchWrap: { alignItems: 'center', paddingHorizontal: Spacing.four, paddingTop: Spacing.two, gap: Spacing.two },
  chipRow: { gap: Spacing.two, paddingVertical: Spacing.two },
  chip: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.one, borderRadius: Spacing.five },
  cardWrap: { flex: 1 },
  card: { gap: Spacing.one },
  imageWrap: { aspectRatio: 1, borderRadius: Spacing.two, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});
