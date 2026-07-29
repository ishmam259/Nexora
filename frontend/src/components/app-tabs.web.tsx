import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps, TabListProps } from 'expo-router/ui';
import type { Href } from 'expo-router';
import { SymbolView, SymbolViewProps } from 'expo-symbols';
import { Pressable, View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from './themed-text';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const TAB_ICONS: Record<string, SymbolViewProps['name']> = {
  home: { ios: 'square.grid.2x2.fill', android: 'apps', web: 'apps' },
  chat: { ios: 'message.fill', android: 'chat_bubble', web: 'chat_bubble' },
  assistant: { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' },
  wallet: { ios: 'wallet.pass.fill', android: 'account_balance_wallet', web: 'account_balance_wallet' },
  profile: { ios: 'person.fill', android: 'person', web: 'person' },
};

/**
 * Web/desktop tab chrome that mirrors a real mobile bottom tab bar:
 * icon above label, fixed to the bottom, equal-width slots — not a top nav.
 */
export default function AppTabs() {
  return (
    <View style={styles.shell}>
      <Tabs>
        <TabSlot style={styles.slot} />
        <TabList asChild>
          <BottomTabBar>
            <TabTrigger name="home" href="/" asChild>
              <TabButton icon={TAB_ICONS.home}>Apps</TabButton>
            </TabTrigger>
            <TabTrigger name="chat" href="/chat" asChild>
              <TabButton icon={TAB_ICONS.chat}>Chat</TabButton>
            </TabTrigger>
            <TabTrigger name="assistant" href={'/assistant' as Href} asChild>
              <TabButton icon={TAB_ICONS.assistant}>AI</TabButton>
            </TabTrigger>
            <TabTrigger name="wallet" href="/wallet" asChild>
              <TabButton icon={TAB_ICONS.wallet}>Wallet</TabButton>
            </TabTrigger>
            <TabTrigger name="profile" href="/profile" asChild>
              <TabButton icon={TAB_ICONS.profile}>Profile</TabButton>
            </TabTrigger>
          </BottomTabBar>
        </TabList>
      </Tabs>
    </View>
  );
}

function TabButton({
  children,
  icon,
  isFocused,
  ...props
}: TabTriggerSlotProps & { icon?: SymbolViewProps['name'] }) {
  const colors = useTheme();
  const tint = isFocused ? colors.primary : colors.textTertiary;

  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: !!isFocused }}
      style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
    >
      {icon && <SymbolView name={icon} tintColor={tint} size={22} />}
      <ThemedText
        type="caption"
        style={{
          color: tint,
          fontWeight: isFocused ? '700' : '500',
          fontSize: 11,
        }}
      >
        {children}
      </ThemedText>
    </Pressable>
  );
}

function BottomTabBar(props: TabListProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'web' ? 10 : 8);

  return (
    <View
      {...props}
      style={[
        styles.bar,
        {
          backgroundColor: theme.backgroundElement,
          borderTopColor: theme.borderSubtle,
          paddingBottom: bottomPad,
          shadowColor: theme.shadow,
        },
      ]}
    >
      <View style={styles.barInner}>{props.children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  slot: {
    flex: 1,
    height: '100%',
  },
  bar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  barInner: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: Spacing.one + 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: Spacing.one,
    minHeight: 52,
  },
  pressed: {
    opacity: 0.7,
  },
});
