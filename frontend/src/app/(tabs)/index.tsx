import { router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { SpringboardIcon } from '@/components/ui/springboard-icon';
import { SPRINGBOARD_ITEMS } from '@/constants/modules';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { getMyWallet } from '@/services/api/wallet';
import { formatMoneyCompact } from '@/utils/format';

function greetingForHour(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const { data: wallet, loading: walletLoading, error: walletError, refresh: refreshWallet } = useAsync(
    () => getMyWallet(),
    []
  );

  const firstName = user?.name?.split(' ')[0] ?? user?.username ?? 'there';
  const greeting = greetingForHour(new Date().getHours());

  const balanceLabel = wallet
    ? formatMoneyCompact(wallet.balance, wallet.currency)
    : walletError
      ? 'Wallet'
      : null;

  return (
    <Screen tabInset>
      <View style={[StyleSheet.absoluteFill, styles.ambientLayer]} pointerEvents="none">
        <View style={[styles.blob, styles.blobTeal, { backgroundColor: theme.primary + '18' }]} />
        <View style={[styles.blob, styles.blobCoral, { backgroundColor: '#F97316' + '14' }]} />
      </View>

      <View style={styles.topBar}>
        <View style={styles.greetingBlock}>
          <ThemedText type="caption" themeColor="textSecondary">
            {greeting}
          </ThemedText>
          <ThemedText type="title" numberOfLines={1} style={styles.name}>
            {firstName}
          </ThemedText>
        </View>

        <Pressable
          onPress={() => (walletError ? refreshWallet() : router.push('/wallet'))}
          accessibilityRole="button"
          accessibilityLabel={
            wallet
              ? `Wallet balance ${formatMoneyCompact(wallet.balance, wallet.currency)}`
              : walletError
                ? 'Wallet unavailable. Tap to retry.'
                : 'Loading wallet balance'
          }
          style={({ pressed }) => [
            styles.walletChip,
            {
              backgroundColor: theme.backgroundElement,
              opacity: pressed ? 0.88 : 1,
              shadowColor: theme.shadow,
            },
          ]}
        >
          <SymbolView
            name={{ ios: 'wallet.pass.fill', android: 'account_balance_wallet', web: 'account_balance_wallet' }}
            tintColor={theme.primary}
            size={16}
          />
          {walletLoading && !wallet ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <ThemedText type="smallBold" numberOfLines={1}>
              {balanceLabel ?? '—'}
            </ThemedText>
          )}
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            tintColor={theme.textTertiary}
            size={12}
          />
        </Pressable>
      </View>

      <View style={styles.springboardHeader}>
        <ThemedText type="subtitle">Campus apps</ThemedText>
      </View>

      <View style={styles.grid} accessibilityRole="summary" accessibilityLabel="Campus services">
        {SPRINGBOARD_ITEMS.map((item) => (
          <SpringboardIcon
            key={item.key}
            label={item.label}
            icon={item.icon}
            color={item.color}
            onPress={() => router.push(item.href)}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  ambientLayer: {
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  blobTeal: {
    top: -40,
    right: -60,
  },
  blobCoral: {
    top: 180,
    left: -80,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.three,
    marginBottom: Spacing.two,
  },
  greetingBlock: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    gap: 2,
  },
  name: {
    fontSize: 32,
    letterSpacing: -0.6,
  },
  walletChip: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.full,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  springboardHeader: {
    marginTop: Spacing.two,
    marginBottom: -Spacing.one,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.one,
  },
});
