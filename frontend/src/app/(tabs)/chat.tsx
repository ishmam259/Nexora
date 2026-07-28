import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState, ErrorState, LoadingView } from '@/components/ui/feedback-states';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { TextField } from '@/components/ui/text-field';
import { CHAT_COLOR } from '@/constants/modules';
import { MinTouchTarget, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { createConversation, getConversationsForUser } from '@/services/api/chat';
import { formatDateTime } from '@/utils/format';

export default function ChatScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const [newChatOpen, setNewChatOpen] = useState(false);

  const { data, loading, error, refresh, refreshing } = useAsync(
    () => (user ? getConversationsForUser(user.username) : Promise.resolve([])),
    [user?.username]
  );

  if (!user || loading) return <LoadingView message="Loading conversations…" />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <>
      <Screen scroll={false} tabInset padded={false}>
        <View style={styles.headerWrap}>
          <ScreenHeader
            title="Messages"
            subtitle="Chat with classmates and sellers"
            action={
              <Pressable
                onPress={() => setNewChatOpen(true)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Start new conversation"
                style={({ pressed }) => [
                  styles.composeButton,
                  { backgroundColor: theme.primaryMuted, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <SymbolView
                  name={{ ios: 'square.and.pencil', android: 'edit_square', web: 'edit_square' }}
                  tintColor={CHAT_COLOR}
                  size={20}
                />
              </Pressable>
            }
          />
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
              <Pressable
                onPress={() => router.push(`/conversation/${item.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Conversation with ${other}`}
                style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
              >
                <Card style={styles.row}>
                  <Avatar label={other} color={CHAT_COLOR} />
                  <View style={styles.rowText}>
                    <ThemedText type="smallBold" numberOfLines={1}>
                      {other}
                    </ThemedText>
                    <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
                      {item.lastMessage?.content ?? 'No messages yet'}
                    </ThemedText>
                  </View>
                  {item.lastMessage && (
                    <ThemedText type="caption" themeColor="textTertiary">
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
          <View style={[styles.sheetHandle, { backgroundColor: theme.border }]} />
          <ThemedText type="headline">New conversation</ThemedText>
          <TextField
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="e.g. student_user"
            autoCapitalize="none"
            hint="Enter their Nexora username exactly as shown on their profile."
          />
          <Button label="Start chat" onPress={start} loading={submitting} />
          <Button label="Cancel" variant="ghost" onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  headerWrap: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, paddingBottom: Spacing.two },
  composeButton: {
    width: MinTouchTarget,
    height: MinTouchTarget,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  rowText: { flex: 1, gap: 2 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.four, gap: Spacing.three },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.one },
});
