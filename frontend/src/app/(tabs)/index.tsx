import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { ModuleCard } from '@/components/ui/module-card';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { AI_ASSISTANT_COLOR, MODULES } from '@/constants/modules';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { getMyWallet } from '@/services/api/wallet';
import { formatMoney } from '@/utils/format';

export default function HomeScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const { data: wallet } = useAsync(() => getMyWallet(), []);

  const firstName = user?.name?.split(' ')[0] ?? user?.username ?? 'there';

  return (
    <Screen tabInset>
      <View>
        <ThemedText themeColor="textSecondary">Welcome back,</ThemedText>
        <ThemedText type="title" style={styles.greeting}>
          {firstName}
        </ThemedText>
      </View>

      <Card onPress={() => router.push('/wallet')} style={styles.walletCard}>
        <View style={styles.walletRow}>
          <View>
            <ThemedText type="small" themeColor="textSecondary">
              Nexora Wallet
            </ThemedText>
            <ThemedText type="subtitle" style={styles.walletBalance}>
              {wallet ? formatMoney(wallet.balance, wallet.currency) : '···'}
            </ThemedText>
          </View>
          <View style={[styles.walletIcon, { backgroundColor: theme.primary + '26' }]}>
            <SymbolView
              name={{ ios: 'wallet.pass.fill', android: 'account_balance_wallet', web: 'account_balance_wallet' }}
              tintColor={theme.primary}
              size={22}
            />
          </View>
        </View>
      </Card>

      <SectionHeader title="Campus services" />
      <View style={styles.grid}>
        {MODULES.map((mod) => (
          <ModuleCard key={mod.key} label={mod.label} icon={mod.icon} color={mod.color} onPress={() => router.push(mod.href)} />
        ))}
      </View>

      <SectionHeader title="More" />
      <View style={styles.linkColumn}>
        <Card onPress={() => router.push('/notifications')} style={styles.linkRow}>
          <View style={styles.linkRowInner}>
            <SymbolView name={{ ios: 'bell.fill', android: 'notifications', web: 'notifications' }} tintColor={theme.text} size={18} />
            <ThemedText>Notifications</ThemedText>
          </View>
          <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} tintColor={theme.textSecondary} size={16} />
        </Card>
        <Card onPress={() => router.push('/ai-assistant')} style={styles.linkRow}>
          <View style={styles.linkRowInner}>
            <SymbolView name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }} tintColor={AI_ASSISTANT_COLOR} size={18} />
            <ThemedText>Ask the Nexora Assistant</ThemedText>
          </View>
          <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} tintColor={theme.textSecondary} size={16} />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: { marginTop: -Spacing.half },
  walletCard: { paddingVertical: Spacing.three },
  walletRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  walletBalance: { fontSize: 22, marginTop: Spacing.half },
  walletIcon: { width: 44, height: 44, borderRadius: Spacing.three, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, justifyContent: 'space-between' },
  linkColumn: { gap: Spacing.two },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.two },
  linkRowInner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
