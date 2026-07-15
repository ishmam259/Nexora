import { useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { EmptyState, LoadingView } from '@/components/ui/feedback-states';
import { listContainerStyle } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { AI_ASSISTANT_COLOR } from '@/constants/modules';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { askAi, getAiHistory } from '@/services/api/ai';

interface Bubble {
  id: string;
  from: 'user' | 'ai';
  text: string;
}

export default function AiAssistantScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const listRef = useRef<FlatList>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const { loading } = useAsync(async () => {
    if (!user) return [];
    const history = await getAiHistory(user.username);
    const initial = history.flatMap<Bubble>((entry) => [
      { id: `${entry.id}-q`, from: 'user', text: entry.query },
      { id: `${entry.id}-a`, from: 'ai', text: entry.response },
    ]);
    setBubbles(initial);
    return initial;
  }, [user?.username]);

  const send = async () => {
    const query = draft.trim();
    if (!query || sending || !user) return;
    setDraft('');
    setBubbles((prev) => [...prev, { id: `local-${Date.now()}`, from: 'user', text: query }]);
    setSending(true);
    try {
      const result = await askAi(user.username, query);
      setBubbles((prev) => [...prev, { id: `${result.id}-a`, from: 'ai', text: result.response }]);
    } catch (err: any) {
      setBubbles((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, from: 'ai', text: err?.message ?? "Sorry, I couldn't reach the assistant service." },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (!user || loading) return <LoadingView />;

  return (
    <View style={styles.root}>
      <FlatList
        ref={listRef}
        style={listContainerStyle}
        contentContainerStyle={styles.list}
        data={bubbles}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <EmptyState
            icon={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }}
            title="Ask me anything about campus"
            message='Try "What restaurants are open right now?" or "Find me a laundry slot this evening."'
          />
        }
        renderItem={({ item }) => (
          <View style={[styles.bubbleRow, item.from === 'user' && styles.bubbleRowUser]}>
            {item.from === 'ai' && (
              <View style={[styles.avatar, { backgroundColor: AI_ASSISTANT_COLOR + '26' }]}>
                <SymbolView name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }} tintColor={AI_ASSISTANT_COLOR} size={14} />
              </View>
            )}
            <View
              style={[
                styles.bubble,
                { backgroundColor: item.from === 'user' ? theme.primary : theme.backgroundElement },
              ]}
            >
              <ThemedText style={{ color: item.from === 'user' ? theme.onPrimary : theme.text }}>{item.text}</ThemedText>
            </View>
          </View>
        )}
      />

      <View style={[styles.composer, listContainerStyle, { borderTopColor: theme.border }]}>
        <View style={styles.composerField}>
          <TextField
            value={draft}
            onChangeText={setDraft}
            placeholder="Ask the Nexora Assistant…"
            multiline
            onSubmitEditing={send}
          />
        </View>
        <Button label={sending ? '…' : 'Send'} onPress={send} loading={sending} disabled={!draft.trim()} style={styles.sendButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { padding: Spacing.four, gap: Spacing.three, flexGrow: 1 },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.one, maxWidth: '85%' },
  bubbleRowUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  avatar: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  bubble: { borderRadius: Spacing.three, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    padding: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignSelf: 'center',
    width: '100%',
  },
  composerField: { flex: 1 },
  sendButton: { paddingHorizontal: Spacing.four },
});
