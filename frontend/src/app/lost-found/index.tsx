import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { EmptyState, ErrorState, LoadingView } from '@/components/ui/feedback-states';
import { listContainerStyle, listContentStyle } from '@/components/ui/screen';
import { StatusBadge } from '@/components/ui/status-badge';
import { TextField } from '@/components/ui/text-field';
import { MODULES } from '@/constants/modules';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { FoundItemResponseDto, getFoundItems, getLostItems, LostItemResponseDto } from '@/services/api/lostFound';
import { formatDate } from '@/utils/format';

const ACCENT = MODULES.find((m) => m.key === 'lost-found')!.color;

export default function LostFoundScreen() {
  const theme = useTheme();
  const [tab, setTab] = useState<'lost' | 'found'>('lost');
  const [search, setSearch] = useState('');

  const { data, loading, error, refresh, refreshing } = useAsync<(LostItemResponseDto | FoundItemResponseDto)[]>(
    () => (tab === 'lost' ? getLostItems({ search: search || undefined }) : getFoundItems({ search: search || undefined })),
    [tab, search]
  );

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
      <View style={[listContainerStyle, { alignSelf: 'center', paddingHorizontal: Spacing.four, paddingTop: Spacing.three, gap: Spacing.two }]}>
        <View style={{ flexDirection: 'row', gap: Spacing.two }}>
          {(['lost', 'found'] as const).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={{ flex: 1 }}>
              <View
                style={{
                  paddingVertical: Spacing.two,
                  borderRadius: Spacing.two,
                  alignItems: 'center',
                  backgroundColor: tab === t ? ACCENT : theme.backgroundElement,
                }}
              >
                <ThemedText style={{ color: tab === t ? '#fff' : theme.text, fontWeight: '600' }}>{t === 'lost' ? 'Lost items' : 'Found items'}</ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
        <TextField value={search} onChangeText={setSearch} placeholder={`Search ${tab} items…`} />
      </View>

      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <FlatList
          style={listContainerStyle}
          contentContainerStyle={listContentStyle()}
          data={data ?? []}
          keyExtractor={(item) => String(item.id)}
          onRefresh={refresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <EmptyState
              icon={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
              title={tab === 'lost' ? 'No lost items reported' : 'No found items reported'}
              message="Tap the + button to report an item."
            />
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/lost-found/${tab}/${item.id}`)}>
              <Card>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <ThemedText type="smallBold" style={{ flex: 1 }} numberOfLines={1}>
                    {item.title}
                  </ThemedText>
                  <StatusBadge status={item.status} />
                </View>
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
                  {item.description}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
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
