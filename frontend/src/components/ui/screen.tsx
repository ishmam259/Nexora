import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  padded?: boolean;
  /** Reserve space for the bottom tab bar (only needed for screens inside the tab navigator). */
  tabInset?: boolean;
};

export function Screen({ children, scroll = true, refreshing, onRefresh, padded = true, tabInset = false }: ScreenProps) {
  const theme = useTheme();

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        padded && styles.padded,
        tabInset && { paddingBottom: BottomTabInset + Spacing.five },
      ]}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={theme.primary} /> : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, padded && styles.padded, { flex: 1 }]}>{children}</View>
  );

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {content}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center' },
  safeArea: { flex: 1, width: '100%', maxWidth: MaxContentWidth },
  flex: { flex: 1 },
  content: { flexGrow: 1 },
  padded: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, gap: Spacing.three },
});

/** For FlatList-based screens: pass as `style` to center content on wide/web viewports. */
export const listContainerStyle = { width: '100%' as const, maxWidth: MaxContentWidth, alignSelf: 'center' as const };

/** For FlatList-based screens: pass as `contentContainerStyle`. */
export function listContentStyle(tabInset = false) {
  return {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: tabInset ? BottomTabInset + Spacing.five : Spacing.five,
    gap: Spacing.two,
    flexGrow: 1,
  };
}
