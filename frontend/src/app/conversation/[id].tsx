import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { ErrorState, LoadingView } from '@/components/ui/feedback-states';
import { listContainerStyle } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { getConversation, getMessages, markMessagesRead, sendMessage } from '@/services/api/chat';
import { formatDateTime } from '@/utils/format';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = Number(id);
  const { user } = useAuth();
  const theme = useTheme();
  const listRef = useRef<FlatList>(null);

  const { data: conversation } = useAsync(() => getConversation(conversationId), [conversationId]);
  const {
    data: messages = [],
    loading,
    error,
    refresh,
    setData: setMessages,
  } = useAsync(() => getMessages(conversationId), [conversationId]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user?.username) {
      markMessagesRead(conversationId, user.username).catch(() => {});
    }
  }, [conversationId, user?.username]);

  const otherParticipant = conversation
    ? conversation.participantOne === user?.username
      ? conversation.participantTwo
      : conversation.participantOne
    : '…';

  const send = async () => {
    const content = draft.trim();
    if (!content || sending || !user) return;
    setDraft('');
    setSending(true);
    try {
      const message = await sendMessage(conversationId, { senderId: user.username, content });
      setMessages((prev) => [...(prev ?? []), message]);
    } catch {
      setDraft(content);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingView />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: otherParticipant }} />
      <FlatList
        ref={listRef}
        style={listContainerStyle}
        contentContainerStyle={styles.list}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const mine = item.senderId === user?.username;
          return (
            <View style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
              <View style={[styles.bubble, { backgroundColor: mine ? theme.primary : theme.backgroundElement }]}>
                <ThemedText style={{ color: mine ? theme.onPrimary : theme.text }}>{item.content}</ThemedText>
              </View>
              <ThemedText type="small" themeColor="textSecondary" style={mine ? styles.timeMine : undefined}>
                {formatDateTime(item.sentAt)}
              </ThemedText>
            </View>
          );
        }}
      />
      <View style={[styles.composer, listContainerStyle, { borderTopColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <TextField value={draft} onChangeText={setDraft} placeholder="Message…" multiline onSubmitEditing={send} />
        </View>
        <Button label="Send" onPress={send} loading={sending} disabled={!draft.trim()} style={styles.sendButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { padding: Spacing.four, gap: Spacing.two, flexGrow: 1 },
  bubbleRow: { maxWidth: '80%', gap: 2 },
  bubbleRowMine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubble: { borderRadius: Spacing.three, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  timeMine: { textAlign: 'right' },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    padding: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignSelf: 'center',
    width: '100%',
  },
  sendButton: { paddingHorizontal: Spacing.four },
});
