import { Stack, useLocalSearchParams } from 'expo-router';
import { Alert, Linking, Pressable, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorState, LoadingView } from '@/components/ui/feedback-states';
import { Screen } from '@/components/ui/screen';
import { StatusBadge } from '@/components/ui/status-badge';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { getLostItem, markLostItemStatus } from '@/services/api/lostFound';
import { formatDateTime, formatMoney } from '@/utils/format';

export default function LostItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const theme = useTheme();
  const { data: item, loading, error, refresh } = useAsync(() => getLostItem(Number(id)), [id]);

  if (loading) return <LoadingView />;
  if (error || !item) return <ErrorState message={error ?? 'Item not found.'} onRetry={refresh} />;

  const isOwner = item.reportedBy === user?.username;

  const resolve = async () => {
    try {
      await markLostItemStatus(item.id, 'RESOLVED');
      refresh();
    } catch (err: any) {
      Alert.alert('Could not update', err?.message ?? 'Please try again.');
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: item.title }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <ThemedText type="subtitle" style={{ flex: 1 }}>
          {item.title}
        </ThemedText>
        <StatusBadge status={item.status} />
      </View>
      <ThemedText themeColor="textSecondary">{item.description}</ThemedText>

      <Card>
        <Row label="Category" value={item.category} />
        <Row label="Last seen" value={item.lostLocation} />
        <Row label="Date" value={formatDateTime(item.lostDate)} />
        {item.reward != null && <Row label="Reward" value={formatMoney(item.reward)} />}
      </Card>

      <Card>
        <ThemedText type="smallBold">Contact</ThemedText>
        <Pressable onPress={() => Linking.openURL(`tel:${item.contactDetails}`).catch(() => {})}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.one, marginTop: Spacing.one }}>
            <SymbolView name={{ ios: 'phone.fill', android: 'call', web: 'call' }} tintColor={theme.primary} size={16} />
            <ThemedText style={{ color: theme.primary }}>{item.contactDetails}</ThemedText>
          </View>
        </Pressable>
      </Card>

      {isOwner && item.status !== 'RESOLVED' && <Button label="Mark as resolved" variant="secondary" onPress={resolve} />}
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="small">{value}</ThemedText>
    </View>
  );
}
