import { router, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { ChipRow } from '@/components/ui/chip-row';
import { EmptyState, ErrorState, LoadingView } from '@/components/ui/feedback-states';
import { listContainerStyle, listContentStyle } from '@/components/ui/screen';
import { Segmented } from '@/components/ui/segmented';
import { StatusBadge } from '@/components/ui/status-badge';
import { TextField } from '@/components/ui/text-field';
import { MODULES } from '@/constants/modules';
import { Radius, Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { FoundItemResponseDto, getFoundItems, getLostItems, LostItemResponseDto } from '@/services/api/lostFound';
import { formatDate } from '@/utils/format';

const ACCENT = MODULES.find((m) => m.key === 'lost-found')!.color;

export default function LostFoundScreen() {
  const theme = useTheme();
  const [tab, setTab] = useState<'found' | 'lost'>('found');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const { data, loading, error, refresh, refreshing } = useAsync<(LostItemResponseDto | FoundItemResponseDto)[]>(
    () => (tab === 'lost' ? getLostItems({ search: search || undefined }) : getFoundItems({ search: search || undefined })),
    [tab, search]
  );

  const categories = useMemo(() => {
    const unique = Array.from(new Set((data ?? []).map((i) => i.category).filter(Boolean)));
    return [{ id: null, label: 'All' }, ...unique.map((c) => ({ id: c, label: c }))];
  }, [data]);

  const visible = useMemo(() => (data ?? []).filter((i) => !category || i.category === category), [data, category]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Lost & Found',
          headerRight: () => (
            <Pressable onPress={() => router.push('/lost-found/new')} hitSlop={8}>
              <SymbolView name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' }} tintColor={ACCENT} size={22} />
            </Pressable>
          ),
        }}
      />
      <View style={[listContainerStyle, styles.headerWrap]}>
        <Segmented
          options={[
            { value: 'found', label: 'Found items' },
            { value: 'lost', label: 'Lost reports' },
          ]}
          value={tab}
          onChange={(v) => {
            setTab(v);
            setCategory(null);
          }}
        />
        <TextField
          value={search}
          onChangeText={setSearch}
          placeholder={`Search ${tab} items…`}
          icon={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
        />
        {categories.length > 1 && <ChipRow options={categories} value={category} onChange={setCategory} />}
      </View>

      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <FlatList
          style={listContainerStyle}
          contentContainerStyle={listContentStyle()}
          data={visible}
          keyExtractor={(item) => String(item.id)}
          onRefresh={refresh}
          refreshing={refreshing}
          numColumns={2}
          columnWrapperStyle={{ gap: Spacing.two }}
          ListEmptyComponent={
            <EmptyState
              icon={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
              title={tab === 'lost' ? 'No lost items reported' : 'No found items reported'}
              message="Tap the + button to report an item."
            />
          }
          renderItem={({ item }) => (
            <Pressable style={styles.cardWrap} onPress={() => router.push(`/lost-found/${tab}/${item.id}`)}>
              <Card style={styles.card}>
                <View style={[styles.thumb, { backgroundColor: theme.tile }]}>
                  <SymbolView
                    name={{ ios: 'shippingbox', android: 'inventory_2', web: 'inventory_2' }}
                    tintColor={theme.textTertiary}
                    size={28}
                  />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.one }}>
                  <ThemedText type="smallBold" style={{ flex: 1 }} numberOfLines={1}>
                    {item.title}
                  </ThemedText>
                  <StatusBadge status={item.status} />
                </View>
                <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
                  {item.category} · {formatDate('lostDate' in item ? item.lostDate : item.foundDate)}
                </ThemedText>
              </Card>
            </Pressable>
          )}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  headerWrap: { alignSelf: 'center', paddingHorizontal: Spacing.four, paddingTop: Spacing.three, gap: Spacing.two },
  cardWrap: { flex: 1 },
  card: { gap: Spacing.one, padding: Spacing.two },
  thumb: {
    aspectRatio: 1,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
