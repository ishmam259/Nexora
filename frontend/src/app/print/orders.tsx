import { Stack } from 'expo-router';
import { FlatList, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { EmptyState, ErrorState, LoadingView } from '@/components/ui/feedback-states';
import { listContainerStyle, listContentStyle } from '@/components/ui/screen';
import { StatusBadge } from '@/components/ui/status-badge';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { getMyPrintOrders } from '@/services/api/print';
import { formatDateTime, formatMoney } from '@/utils/format';

export default function PrintOrdersScreen() {
  const { data, loading, error, refresh, refreshing } = useAsync(() => getMyPrintOrders(), []);

  if (loading) return <LoadingView />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <>
      <Stack.Screen options={{ title: 'My Print Orders' }} />
      <FlatList
        style={listContainerStyle}
        contentContainerStyle={listContentStyle()}
        data={data ?? []}
        keyExtractor={(item) => String(item.id)}
        onRefresh={refresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <EmptyState
            icon={{ ios: 'printer', android: 'print', web: 'print' }}
            title="No print jobs yet"
            message="Send a document to the print desk and track it here."
          />
        }
        renderItem={({ item }) => (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedText type="smallBold" numberOfLines={1} style={{ flex: 1 }}>
                {item.fileName}
              </ThemedText>
              <ThemedText type="smallBold">{formatMoney(item.amount)}</ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {item.pageCount} pages · {item.copies} {item.copies === 1 ? 'copy' : 'copies'} · {item.color ? 'Color' : 'B&W'}
              {item.doubleSided ? ' · Double-sided' : ''}
            </ThemedText>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.one }}>
              <StatusBadge status={item.status} />
              <ThemedText type="small" themeColor="textSecondary">
                {formatDateTime(item.createdAt)}
              </ThemedText>
            </View>
          </Card>
        )}
      />
    </>
  );
}
