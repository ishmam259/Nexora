import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState, ErrorState, LoadingView } from '@/components/ui/feedback-states';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { CHAT_COLOR } from '@/constants/modules';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { createConversation, getConversationsForUser } from '@/services/api/chat';
import { formatDateTime } from '@/utils/format';

export default function ChatScreen() {
  const { user } = useAuth();
  const [newChatOpen, setNewChatOpen] = useState(false);

  const { data, loading, error, refresh, refreshing } = useAsync(
    () => (user ? getConversationsForUser(user.username) : Promise.resolve([])),
    [user?.username]
  );

  if (!user || loading) return <LoadingView />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <>
      <Screen scroll={false} tabInset padded={false}>
        <View style={styles.header}>
          <ThemedText type="title">Chat</ThemedText>
          <Pressable onPress={() => setNewChatOpen(true)} hitSlop={8}>
            <SymbolView name={{ ios: 'square.and.pencil', android: 'edit_square', web: 'edit_square' }} tintColor={CHAT_COLOR} size={22} />
          </Pressable>
        </View>
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => String(item.id)}
          onRefresh={refresh}
          refreshing={refreshing}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon={{ ios: 'message', android: 'chat_bubble', web: 'chat_bubble' }}
              title="No conversations yet"
              message="Start a chat with a seller, buyer, or classmate."
            />
          }
          renderItem={({ item }) => {
            const other = item.participantOne === user?.username ? item.participantTwo : item.participantOne;
            return (
              <Pressable onPress={() => router.push(`/conversation/${item.id}`)}>
                <Card style={styles.row}>
                  <View style={[styles.avatar, { backgroundColor: CHAT_COLOR }]}>
                    <ThemedText style={styles.avatarText}>{other.charAt(0).toUpperCase()}</ThemedText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="smallBold">{other}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                      {item.lastMessage?.content ?? 'No messages yet'}
                    </ThemedText>
                  </View>
                  {item.lastMessage && (
                    <ThemedText type="small" themeColor="textSecondary">
                      {formatDateTime(item.lastMessage.sentAt)}
                    </ThemedText>
                  )}
                </Card>
              </Pressable>
            );
          }}
        />
      </Screen>

      <NewChatModal visible={newChatOpen} onClose={() => setNewChatOpen(false)} />
    </>
  );
}

function NewChatModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const start = async () => {
    if (!username.trim() || !user) return;
    setSubmitting(true);
    try {
      const conversation = await createConversation({ participantOne: user.username, participantTwo: username.trim() });
      setUsername('');
      onClose();
      router.push(`/conversation/${conversation.id}`);
    } catch (err: any) {
      Alert.alert('Could not start chat', err?.message ?? 'Please check the username and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: theme.background }]} onPress={(e) => e.stopPropagation()}>
          <ThemedText type="subtitle">New conversation</ThemedText>
          <TextField label="Username" value={username} onChangeText={setUsername} placeholder="e.g. jrahman" autoCapitalize="none" />
          <Button label="Start chat" onPress={start} loading={submitting} />
          <Button label="Cancel" variant="ghost" onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  list: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.five, gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: Spacing.four, borderTopRightRadius: Spacing.four, padding: Spacing.four, gap: Spacing.two },
});
