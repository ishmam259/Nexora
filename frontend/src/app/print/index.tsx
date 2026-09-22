import { router, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Switch, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { BottomBar } from '@/components/ui/bottom-bar';
import { Card } from '@/components/ui/card';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { Screen } from '@/components/ui/screen';
import { Segmented } from '@/components/ui/segmented';
import { SectionHeader } from '@/components/ui/section-header';
import { TextField } from '@/components/ui/text-field';
import { MODULES } from '@/constants/modules';
import { Radius, Spacing } from '@/constants/theme';
import { createPrintOrder, estimatePrintPrice } from '@/services/api/print';
import { payWithWallet } from '@/services/api/payment';
import { useTheme } from '@/hooks/use-theme';
import { formatMoney } from '@/utils/format';

const ACCENT = MODULES.find((m) => m.key === 'print')!.color;

export default function PrintScreen() {
  const theme = useTheme();
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [pageCount, setPageCount] = useState('1');
  const [copies, setCopies] = useState(1);
  const [color, setColor] = useState<'bw' | 'color'>('bw');
  const [doubleSided, setDoubleSided] = useState(false);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pages = Number(pageCount) || 0;
  const isColor = color === 'color';
  const sheets = doubleSided ? Math.ceil(pages / 2) : pages;
  const total = useMemo(
    () => estimatePrintPrice(pages, copies, isColor, doubleSided),
    [pages, copies, isColor, doubleSided]
  );

  const submit = async () => {
    if (!fileName.trim() || !fileUrl.trim() || !pages) {
      Alert.alert('Missing details', 'Add a file name, a link to the file, and the page count.');
      return;
    }
    setSubmitting(true);
    try {
      const payment = await payWithWallet(`print:${fileName.trim()}`, total, fileName.trim());
      await createPrintOrder({
        fileName: fileName.trim(),
        fileUrl: fileUrl.trim(),
        pageCount: pages,
        copies,
        color: isColor,
        doubleSided,
        amount: total,
        paymentReference: payment.transactionId,
        customerNote: note.trim(),
      });
      if (Platform.OS === 'web') {
        router.push('/print/orders');
      } else {
        Alert.alert('Sent to print desk', 'Your document is queued.', [{ text: 'View orders', onPress: () => router.push('/print/orders') }]);
      }
    } catch (err: any) {
      Alert.alert('Could not submit', err?.message ?? 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: 'Print',
          headerRight: () => (
            <Pressable onPress={() => router.push('/print/orders')} hitSlop={8}>
              <SymbolView name={{ ios: 'clock.arrow.circlepath', android: 'history', web: 'history' }} tintColor={ACCENT} size={20} />
            </Pressable>
          ),
        }}
      />
      <Screen tabInset={false}>
        <Card style={styles.fileRow}>
          <View style={[styles.fileIcon, { backgroundColor: theme.primaryMuted }]}>
            <SymbolView name={{ ios: 'doc.text', android: 'description', web: 'description' }} tintColor={theme.primary} size={18} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <TextField
              value={fileName}
              onChangeText={setFileName}
              placeholder="assignment-3.pdf"
              style={styles.fileNameInput}
            />
            <TextField value={fileUrl} onChangeText={setFileUrl} placeholder="Link to file — drive.google.com/…" autoCapitalize="none" />
          </View>
        </Card>

        <SectionHeader title="Options" />
        <Segmented
          options={[
            { value: 'bw', label: 'Black & white · ৳2/pg' },
            { value: 'color', label: 'Color · ৳5/pg' },
          ]}
          value={color}
          onChange={setColor}
        />

        <Card style={{ padding: 0 }}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <ThemedText type="smallBold">Pages</ThemedText>
            </View>
            <TextField value={pageCount} onChangeText={setPageCount} keyboardType="number-pad" style={styles.pageInput} />
          </View>
          <View style={[styles.row, { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}>
            <View style={{ flex: 1 }}>
              <ThemedText type="smallBold">Copies</ThemedText>
            </View>
            <QuantityStepper value={copies} onChange={setCopies} min={1} max={50} label="copies" />
          </View>
          <View style={[styles.row, { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}>
            <View style={{ flex: 1 }}>
              <ThemedText type="smallBold">Double-sided</ThemedText>
              {pages > 0 && (
                <ThemedText type="caption" themeColor="textSecondary">
                  {pages} pages on {sheets} sheets
                </ThemedText>
              )}
            </View>
            <Switch value={doubleSided} onValueChange={setDoubleSided} trackColor={{ true: theme.primary }} />
          </View>
        </Card>

        <TextField label="Note for the print desk (optional)" value={note} onChangeText={setNote} placeholder="e.g. staple top-left" />

        <Card style={styles.totalCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ThemedText type="caption" themeColor="textSecondary">
              {sheets} sheets × {isColor ? '৳5' : '৳2'} × {copies} {copies === 1 ? 'copy' : 'copies'}
            </ThemedText>
            <ThemedText type="smallBold">{formatMoney(total)}</ThemedText>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ThemedText type="caption" themeColor="textSecondary">
              Pickup
            </ThemedText>
            <ThemedText type="small" style={{ fontWeight: '500' }}>
              Print desk, Library
            </ThemedText>
          </View>
        </Card>
      </Screen>

      <BottomBar label="Total" amount={formatMoney(total)} ctaLabel="Continue to checkout" onPress={submit} loading={submitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  fileRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three },
  fileIcon: { width: 44, height: 48, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  fileNameInput: { fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three, minHeight: 56 },
  pageInput: { width: 72, textAlign: 'center' },
  totalCard: { gap: Spacing.one },
});
