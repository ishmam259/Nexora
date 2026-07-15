import { router, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Switch, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { MODULES } from '@/constants/modules';
import { Spacing } from '@/constants/theme';
import { createPrintOrder, estimatePrintPrice } from '@/services/api/print';
import { payWithWallet } from '@/services/api/payment';
import { formatMoney } from '@/utils/format';

const ACCENT = MODULES.find((m) => m.key === 'print')!.color;

export default function PrintScreen() {
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [pageCount, setPageCount] = useState('1');
  const [copies, setCopies] = useState('1');
  const [color, setColor] = useState(false);
  const [doubleSided, setDoubleSided] = useState(false);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const total = useMemo(
    () => estimatePrintPrice(Number(pageCount) || 0, Number(copies) || 1, color, doubleSided),
    [pageCount, copies, color, doubleSided]
  );

  const submit = async () => {
    if (!fileName.trim() || !fileUrl.trim() || !Number(pageCount)) {
      Alert.alert('Missing details', 'Add a file name, a link to the file, and the page count.');
      return;
    }
    setSubmitting(true);
    try {
      const payment = await payWithWallet(`print:${fileName.trim()}`, total, fileName.trim());
      await createPrintOrder({
        fileName: fileName.trim(),
        fileUrl: fileUrl.trim(),
        pageCount: Number(pageCount),
        copies: Number(copies) || 1,
        color,
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
    <>
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
      <Screen>
        <TextField label="File name" value={fileName} onChangeText={setFileName} placeholder="assignment-3.pdf" />
        <TextField label="Link to file" value={fileUrl} onChangeText={setFileUrl} placeholder="https://drive.google.com/…" autoCapitalize="none" />

        <View style={styles.row}>
          <TextField label="Pages" value={pageCount} onChangeText={setPageCount} keyboardType="number-pad" style={styles.half} />
          <TextField label="Copies" value={copies} onChangeText={setCopies} keyboardType="number-pad" style={styles.half} />
        </View>

        <Card style={styles.toggleRow}>
          <ThemedText>Color printing</ThemedText>
          <Switch value={color} onValueChange={setColor} trackColor={{ true: ACCENT }} />
        </Card>
        <Card style={styles.toggleRow}>
          <ThemedText>Double-sided</ThemedText>
          <Switch value={doubleSided} onValueChange={setDoubleSided} trackColor={{ true: ACCENT }} />
        </Card>

        <TextField label="Note for the print desk (optional)" value={note} onChangeText={setNote} placeholder="Staple, black & white cover…" />

        <Card style={styles.totalCard}>
          <ThemedText themeColor="textSecondary">Estimated cost</ThemedText>
          <ThemedText type="subtitle" style={{ color: ACCENT }}>
            {formatMoney(total)}
          </ThemedText>
        </Card>

        <Button label={`Pay ${formatMoney(total)} & send to print`} onPress={submit} loading={submitting} />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.two },
  half: { flex: 1 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalCard: { alignItems: 'center', gap: Spacing.half },
});
