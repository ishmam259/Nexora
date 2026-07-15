import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState, ErrorState, LoadingView } from '@/components/ui/feedback-states';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { WALLET_COLOR } from '@/constants/modules';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { getMyWallet, getMyWalletTransactions, topUpWallet, WALLET_FUNDING_SOURCES } from '@/services/api/wallet';
import { formatDateTime, formatMoney } from '@/utils/format';

export default function WalletScreen() {
  const theme = useTheme();
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

  if (walletLoading || txLoading) return <LoadingView />;
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
              <Card style={[styles.balanceCard, { backgroundColor: WALLET_COLOR }]}>
                <ThemedText style={styles.balanceLabel}>Nexora Wallet balance</ThemedText>
                <ThemedText style={styles.balanceAmount}>
                  {wallet ? formatMoney(wallet.balance, wallet.currency) : '···'}
                </ThemedText>
                <Pressable onPress={() => setTopUpOpen(true)} style={styles.topUpButton}>
                  <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} tintColor={WALLET_COLOR} size={16} />
                  <ThemedText style={{ color: WALLET_COLOR, fontWeight: '700' }}>Top up</ThemedText>
                </Pressable>
              </Card>

              <SectionHeader title="Recent transactions" actionLabel="Payment history" onAction={() => router.push('/payments')} />
              {txError && <ErrorState message={txError} onRetry={refreshTx} />}
            </View>
          }
          ListEmptyComponent={
            !txError ? (
              <EmptyState
                icon={{ ios: 'creditcard', android: 'credit_card', web: 'credit_card' }}
                title="No transactions yet"
                message="Top up your wallet to start paying for orders across Nexora."
              />
            ) : null
          }
          renderItem={({ item }) => (
            <Card style={styles.txRow}>
              <View style={[styles.txIcon, { backgroundColor: (item.type === 'DEBIT' ? theme.danger : theme.success) + '26' }]}>
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
              <View style={{ flex: 1 }}>
                <ThemedText type="smallBold">{item.description || item.type}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {formatDateTime(item.createdAt)}
                </ThemedText>
              </View>
              <ThemedText style={{ color: item.type === 'DEBIT' ? theme.danger : theme.success, fontWeight: '700' }}>
                {item.type === 'DEBIT' ? '-' : '+'}
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
      setError('Choose where you’re topping up from.');
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
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: theme.background }]} onPress={(e) => e.stopPropagation()}>
          <ThemedText type="subtitle">Top up wallet</ThemedText>
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
            <ThemedText type="small" themeColor="danger">
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
  header: { gap: Spacing.three, marginBottom: Spacing.one },
  balanceCard: { alignItems: 'flex-start', gap: Spacing.one, paddingVertical: Spacing.four },
  balanceLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  balanceAmount: { color: '#ffffff', fontSize: 32, fontWeight: '700' },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: '#ffffff',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
    marginTop: Spacing.two,
  },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  txIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: Spacing.four, borderTopRightRadius: Spacing.four, padding: Spacing.four, gap: Spacing.two },
});
