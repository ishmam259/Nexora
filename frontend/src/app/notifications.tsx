import { FlatList, View } from 'react-native';
import { SymbolView, SymbolViewProps } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { EmptyState, ErrorState, LoadingView } from '@/components/ui/feedback-states';
import { listContainerStyle, listContentStyle } from '@/components/ui/screen';
import { StatusBadge } from '@/components/ui/status-badge';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { getNotificationsFor, NotificationResponseDto, NotificationType } from '@/services/api/notifications';
import { formatDateTime } from '@/utils/format';

const TYPE_ICONS: Record<NotificationType, SymbolViewProps['name']> = {
  EMAIL: { ios: 'envelope.fill', android: 'mail', web: 'mail' },
  SMS: { ios: 'message.fill', android: 'sms', web: 'sms' },
  PUSH: { ios: 'bell.fill', android: 'notifications', web: 'notifications' },
};

export default function NotificationsScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const { data, loading, error, refresh, refreshing } = useAsync(
    () => (user ? getNotificationsFor(user.username) : Promise.resolve([])),
    [user?.username]
  );

  if (!user || loading) return <LoadingView />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <FlatList<NotificationResponseDto>
      style={listContainerStyle}
      contentContainerStyle={listContentStyle()}
      data={data ?? []}
      keyExtractor={(item) => String(item.id)}
      onRefresh={refresh}
      refreshing={refreshing}
      ListEmptyComponent={
        <EmptyState
          icon={{ ios: 'bell.slash', android: 'notifications_off', web: 'notifications_off' }}
          title="You're all caught up"
          message="Nexora will notify you here about orders, appointments, and account activity."
        />
      }
      renderItem={({ item }) => (
        <Card style={{ flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-start' }}>
          <SymbolView name={TYPE_ICONS[item.type]} tintColor={theme.primary} size={18} style={{ marginTop: 2 }} />
          <View style={{ flex: 1, gap: Spacing.one }}>
            <ThemedText type="smallBold">{item.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {item.message}
            </ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.half }}>
              <StatusBadge status={item.status} />
              <ThemedText type="small" themeColor="textSecondary">
                {formatDateTime(item.timestamp)}
              </ThemedText>
            </View>
          </View>
        </Card>
      )}
    />
  );
}
