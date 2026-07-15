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
import { Spacing } from '@/constants/theme';
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
        <TextField value={search} onChangeText={setSearch} placeholder="Search restaurants…" />
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
              <Card style={styles.card}>
                <View style={[styles.imageWrap, { backgroundColor: theme.backgroundSelected }]}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" />
                  ) : (
                    <SymbolView name={{ ios: 'fork.knife', android: 'restaurant', web: 'restaurant' }} tintColor={theme.textSecondary} size={24} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText type="smallBold">{item.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
                    {item.description || item.address}
                  </ThemedText>
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
  searchWrap: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, paddingBottom: Spacing.one },
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  imageWrap: { width: 56, height: 56, borderRadius: Spacing.two, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
});
