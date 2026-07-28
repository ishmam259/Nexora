import { useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AiMessage } from '@/components/ui/ai-message';
import { EmptyState, LoadingView } from '@/components/ui/feedback-states';
import { TextField } from '@/components/ui/text-field';
import { AI_ASSISTANT_COLOR } from '@/constants/modules';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { askAi, getAiHistory } from '@/services/api/ai';

interface Bubble {
  id: string;
  from: 'user' | 'ai';
  text: string;
}

export default function AssistantTabScreen() {
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

  if (!user || loading) return <LoadingView message="Loading assistant…" />;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]} edges={['left', 'right']}>
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: AI_ASSISTANT_COLOR }]}>
          <SymbolView name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }} tintColor="#FFFFFF" size={18} />
        </View>
        <View style={styles.headerText}>
          <ThemedText type="headline">Assistant</ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            Ask anything about campus
          </ThemedText>
        </View>
      </View>

      <FlatList
        ref={listRef}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={bubbles}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <EmptyState
            icon={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }}
            title="Your campus copilot"
            message='Try "Where do I order food?" or "How do I top up my wallet?"'
          />
        }
        renderItem={({ item }) => (
          <View style={[styles.bubbleRow, item.from === 'user' && styles.bubbleRowUser]}>
            {item.from === 'ai' && (
              <View style={[styles.avatar, { backgroundColor: AI_ASSISTANT_COLOR + '22' }]}>
                <SymbolView
                  name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }}
                  tintColor={AI_ASSISTANT_COLOR}
                  size={14}
                />
              </View>
            )}
            <View
              style={[
                styles.bubble,
                item.from === 'user' ? styles.bubbleUser : styles.bubbleAi,
                {
                  backgroundColor: item.from === 'user' ? theme.primary : theme.backgroundElement,
                  shadowColor: theme.shadow,
                },
              ]}
            >
              <AiMessage text={item.text} isUser={item.from === 'user'} />
            </View>
          </View>
        )}
      />

      <View
        style={[
          styles.composer,
          {
            borderTopColor: theme.borderSubtle,
            backgroundColor: theme.backgroundElement,
            paddingBottom: BottomTabInset + Spacing.two,
          },
        ]}
      >
        <View style={styles.composerField}>
          <TextField
            value={draft}
            onChangeText={setDraft}
            placeholder="Ask Nexora…"
            multiline
            onSubmitEditing={send}
          />
        </View>
        <Pressable
          onPress={send}
          disabled={!draft.trim() || sending}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          style={({ pressed }) => [
            styles.sendFab,
            {
              backgroundColor: theme.primary,
              opacity: !draft.trim() || sending ? 0.4 : pressed ? 0.88 : 1,
            },
          ]}
        >
          <SymbolView
            name={{ ios: 'arrow.up', android: 'send', web: 'send' }}
            tintColor={theme.onPrimary}
            size={18}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, maxWidth: MaxContentWidth, width: '100%', alignSelf: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, gap: 2 },
  list: { flex: 1, width: '100%' },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    gap: Spacing.three,
    flexGrow: 1,
  },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.two, maxWidth: '88%' },
  bubbleRowUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  bubble: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    maxWidth: '100%',
  },
  bubbleUser: {
    borderTopRightRadius: Radius.sm,
    borderTopLeftRadius: Radius.lg,
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
  },
  bubbleAi: {
    borderTopLeftRadius: Radius.sm,
    borderTopRightRadius: Radius.lg,
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  composerField: { flex: 1 },
  sendFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
});
