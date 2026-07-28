import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState, ErrorState, LoadingView } from '@/components/ui/feedback-states';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeader } from '@/components/ui/section-header';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { Radius, Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { getMyWallet, getMyWalletTransactions, topUpWallet, WALLET_FUNDING_SOURCES } from '@/services/api/wallet';
import { formatDateTime, formatMoney } from '@/utils/format';
import { useElevation } from '@/utils/elevation';

export default function WalletScreen() {
  const theme = useTheme();
  const elevation = useElevation('md');
  const [topUpOpen, setTopUpOpen] = useState(false);

  const { data: wallet, loading: walletLoading, error: walletError, refresh: refreshWallet } = useAsync(
    () => getMyWallet(),
    []
  );
  const {
    data: page,
    loading: txLoading,
    error: txError,
    refresh: refreshTx,
    refreshing,
  } = useAsync(() => getMyWalletTransactions(0, 20), []);

  const refreshAll = () => {
    refreshWallet();
    refreshTx();
  };

  if (walletLoading || txLoading) return <LoadingView message="Loading wallet…" />;
  if (walletError) return <ErrorState message={walletError} onRetry={refreshAll} />;

  return (
    <>
      <Screen scroll={false} tabInset padded={false}>
        <FlatList
          data={page?.content ?? []}
          keyExtractor={(item) => String(item.id)}
          onRefresh={refreshAll}
          refreshing={!!refreshing}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.header}>
              <ScreenHeader title="Wallet" subtitle="Pay across campus services" />

              <View style={[styles.balanceCard, { backgroundColor: theme.primary }, elevation]}>
                <ThemedText type="caption" style={styles.balanceLabel}>
                  Available balance
                </ThemedText>
                <ThemedText type="title" style={styles.balanceAmount}>
                  {wallet ? formatMoney(wallet.balance, wallet.currency) : '···'}
                </ThemedText>
                <Pressable
                  onPress={() => setTopUpOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Top up wallet"
                  style={({ pressed }) => [styles.topUpButton, { opacity: pressed ? 0.9 : 1 }]}
                >
                  <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} tintColor={theme.primary} size={16} />
                  <ThemedText type="smallBold" style={{ color: theme.primary }}>
                    Top up
                  </ThemedText>
                </Pressable>
              </View>

              <SectionHeader title="Recent activity" actionLabel="All payments" onAction={() => router.push('/payments')} />
              {txError && <ErrorState message={txError} onRetry={refreshTx} />}
            </View>
          }
          ListEmptyComponent={
            !txError ? (
              <EmptyState
                icon={{ ios: 'creditcard', android: 'credit_card', web: 'credit_card' }}
                title="No transactions yet"
                message="Top up your wallet to pay for food, laundry, printing, and more."
              />
            ) : null
          }
          renderItem={({ item }) => (
            <Card style={styles.txRow} elevated={false}>
              <View
                style={[
                  styles.txIcon,
                  { backgroundColor: (item.type === 'DEBIT' ? theme.dangerMuted : theme.successMuted) },
                ]}
              >
                <SymbolView
                  name={
                    item.type === 'DEBIT'
                      ? { ios: 'arrow.up.right', android: 'arrow_upward', web: 'arrow_upward' }
                      : { ios: 'arrow.down.left', android: 'arrow_downward', web: 'arrow_downward' }
                  }
                  tintColor={item.type === 'DEBIT' ? theme.danger : theme.success}
                  size={16}
                />
              </View>
              <View style={styles.txText}>
                <ThemedText type="smallBold" numberOfLines={1}>
                  {item.description || item.type}
                </ThemedText>
                <ThemedText type="caption" themeColor="textSecondary">
                  {formatDateTime(item.createdAt)}
                </ThemedText>
              </View>
              <ThemedText
                type="smallBold"
                style={{ color: item.type === 'DEBIT' ? theme.danger : theme.success }}
              >
                {item.type === 'DEBIT' ? '−' : '+'}
                {formatMoney(item.amount, wallet?.currency)}
              </ThemedText>
            </Card>
          )}
        />
      </Screen>

      <TopUpModal
        visible={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        onSuccess={() => {
          setTopUpOpen(false);
          refreshAll();
        }}
      />
    </>
  );
}

function TopUpModal({ visible, onClose, onSuccess }: { visible: boolean; onClose: () => void; onSuccess: () => void }) {
  const theme = useTheme();
  const [amount, setAmount] = useState('');
  const [fundingSource, setFundingSource] = useState<string | null>(null);
  const [externalReference, setExternalReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setAmount('');
    setFundingSource(null);
    setExternalReference('');
    setError(null);
  };

  const submit = async () => {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount < 1) {
      setError('Enter an amount of at least 1.00.');
      return;
    }
    if (!fundingSource) {
      setError("Choose where you're topping up from.");
      return;
    }
    if (!externalReference.trim()) {
      setError('Enter the transaction ID from your funding source.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await topUpWallet({ amount: numericAmount, fundingSource, externalReference: externalReference.trim() });
      reset();
      onSuccess();
    } catch (err: any) {
      setError(err?.message ?? 'Top up failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close top up dialog">
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.background }]}
          onPress={(e) => e.stopPropagation()}
          accessibilityViewIsModal
        >
          <View style={[styles.sheetHandle, { backgroundColor: theme.border }]} />
          <ThemedText type="headline">Top up wallet</ThemedText>
          <TextField label="Amount (BDT)" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} placeholder="500.00" />
          <SelectField
            label="Funding source"
            value={fundingSource}
            onChange={setFundingSource}
            options={WALLET_FUNDING_SOURCES.map((s) => ({ label: s.replace('_', ' '), value: s }))}
            placeholder="Choose a payment method"
          />
          <TextField
            label="Transaction ID"
            value={externalReference}
            onChangeText={setExternalReference}
            placeholder="e.g. from your bKash confirmation SMS"
            autoCapitalize="characters"
          />
          {error && (
            <ThemedText type="caption" themeColor="danger" accessibilityRole="alert">
              {error}
            </ThemedText>
          )}
          <Button label="Confirm top up" onPress={submit} loading={submitting} />
          <Button label="Cancel" variant="ghost" onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  list: { padding: Spacing.four, gap: Spacing.two, flexGrow: 1 },
  header: { gap: Spacing.four, marginBottom: Spacing.two },
  balanceCard: { borderRadius: Radius.xl, padding: Spacing.four, gap: Spacing.two, alignItems: 'flex-start' },
  balanceLabel: { color: 'rgba(255,255,255,0.8)' },
  balanceAmount: { color: '#FFFFFF' },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.full,
    marginTop: Spacing.two,
  },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  txIcon: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  txText: { flex: 1, gap: 2 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.four, gap: Spacing.three },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.one },
});
