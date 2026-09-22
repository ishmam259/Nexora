import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
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
import { getRestaurants } from '@/services/api/food';

const ACCENT = MODULES.find((m) => m.key === 'food')!.color;

export default function FoodScreen() {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const { data, loading, error, refresh, refreshing } = useAsync(() => getRestaurants(search || undefined), [search]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Food',
          headerRight: () => (
            <Pressable onPress={() => router.push('/food/orders')} hitSlop={8}>
              <SymbolView name={{ ios: 'clock.arrow.circlepath', android: 'history', web: 'history' }} tintColor={ACCENT} size={20} />
            </Pressable>
          ),
        }}
      />
      <View style={[listContainerStyle, styles.searchWrap]}>
        <TextField
          value={search}
          onChangeText={setSearch}
          placeholder="Search restaurants…"
          icon={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
        />
      </View>

      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <FlatList
          style={listContainerStyle}
          contentContainerStyle={listContentStyle()}
          data={(data ?? []).filter((r) => r.active)}
          keyExtractor={(item) => String(item.id)}
          onRefresh={refresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <EmptyState
              icon={{ ios: 'fork.knife', android: 'restaurant', web: 'restaurant' }}
              title="No restaurants open right now"
              message="Check back soon, or try a different search."
            />
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/food/${item.id}`)}>
              <Card style={styles.card} elevated={false}>
                <View style={[styles.imageWrap, { backgroundColor: theme.tile }]}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" />
                  ) : (
                    <SymbolView name={{ ios: 'fork.knife', android: 'restaurant', web: 'restaurant' }} tintColor={theme.textTertiary} size={28} />
                  )}
                </View>
                <View style={styles.cardBody}>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="smallBold">{item.name}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
                      {item.description || item.address}
                    </ThemedText>
                  </View>
                  <View style={[styles.openTag, { backgroundColor: theme.successMuted }]}>
                    <ThemedText type="caption" style={{ color: theme.success, fontWeight: '600' }}>
                      Open
                    </ThemedText>
                  </View>
                </View>
              </Card>
            </Pressable>
          )}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  searchWrap: { alignItems: 'center', paddingHorizontal: Spacing.four, paddingTop: Spacing.two, gap: Spacing.two },
  card: { padding: 0, gap: 0, overflow: 'hidden' },
  imageWrap: {
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: '100%', height: '100%' },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  openTag: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
});
