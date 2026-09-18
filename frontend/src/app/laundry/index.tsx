import { router, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState, ErrorState, LoadingView } from '@/components/ui/feedback-states';
import { Screen } from '@/components/ui/screen';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { MODULES } from '@/constants/modules';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { createLaundryOrder, estimateLaundryPrice, getSlots, LAUNDRY_TYPES, SlotResponseDto } from '@/services/api/laundry';
import { payWithWallet } from '@/services/api/payment';
import { showAlert } from '@/utils/alert';
import { formatDateTime, formatMoney } from '@/utils/format';

const ACCENT = MODULES.find((m) => m.key === 'laundry')!.color;

const TYPE_LABELS: Record<string, string> = {
  WASH_AND_FOLD: 'Wash & fold',
  DRY_CLEAN: 'Dry clean',
  IRON_ONLY: 'Iron only',
  WASH_AND_IRON: 'Wash & iron',
};

export default function LaundryScreen() {
  const { data: slots, loading, error, refresh, refreshing } = useAsync(() => getSlots(), []);
  const [selectedSlot, setSelectedSlot] = useState<SlotResponseDto | null>(null);

  const [weightKg, setWeightKg] = useState('');
  const [laundryType, setLaundryType] = useState<string | null>('WASH_AND_FOLD');
  const [instructions, setInstructions] = useState('');
  const [booking, setBooking] = useState(false);

  const total = useMemo(() => estimateLaundryPrice(Number(weightKg) || 0, laundryType ?? 'WASH_AND_FOLD'), [weightKg, laundryType]);

  if (loading) return <LoadingView />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  const book = async () => {
    if (!selectedSlot) return;
    const weight = Number(weightKg);
    if (!weight || weight <= 0) {
      showAlert('Enter a weight', 'Tell us roughly how many kilograms of laundry you have.');
      return;
    }
    setBooking(true);
    try {
      const payment = await payWithWallet(`laundry:slot:${selectedSlot.id}`, total, selectedSlot.label);
      await createLaundryOrder({
        slotId: selectedSlot.id,
        amount: total,
        paymentReference: payment.transactionId,
        weightKg: weight,
        laundryType: laundryType ?? 'WASH_AND_FOLD',
        specialInstructions: instructions.trim(),
      });
      if (Platform.OS === 'web') {
        router.push('/laundry/orders');
      } else {
        showAlert('Slot booked', `See you at ${selectedSlot.label}.`, [{ text: 'View orders', onPress: () => router.push('/laundry/orders') }]);
      }
    } catch (err: any) {
      showAlert('Booking failed', err?.message ?? 'Please try again.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Laundry',
          headerRight: () => (
            <Pressable onPress={() => router.push('/laundry/orders')} hitSlop={8}>
              <SymbolView name={{ ios: 'clock.arrow.circlepath', android: 'history', web: 'history' }} tintColor={ACCENT} size={20} />
            </Pressable>
          ),
        }}
      />
      <Screen onRefresh={refresh} refreshing={refreshing}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
          Pick a wash slot
        </ThemedText>
        {(slots ?? []).length === 0 && <EmptyState title="No slots available" message="Check back later for open laundry slots." />}
        {(slots ?? []).map((slot) => {
          const full = slot.bookedCount >= slot.maxCapacity;
          const selected = selectedSlot?.id === slot.id;
          return (
            <Pressable key={slot.id} disabled={full} onPress={() => setSelectedSlot(slot)}>
              <Card style={[styles.slotCard, selected && { borderWidth: 2, borderColor: ACCENT }, full && { opacity: 0.5 }]}>
                <View style={{ flex: 1 }}>
                  <ThemedText type="smallBold">{slot.label}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {formatDateTime(slot.startTime)} – {formatDateTime(slot.endTime)}
                  </ThemedText>
                </View>
                <ThemedText type="small" themeColor={full ? 'danger' : 'textSecondary'}>
                  {full ? 'Full' : `${slot.maxCapacity - slot.bookedCount} left`}
                </ThemedText>
              </Card>
            </Pressable>
          );
        })}

        {selectedSlot && (
          <Card style={{ gap: Spacing.two }}>
            <ThemedText type="smallBold">Booking {selectedSlot.label}</ThemedText>
            <TextField label="Weight (kg)" value={weightKg} onChangeText={setWeightKg} keyboardType="decimal-pad" placeholder="3" />
            <SelectField
              label="Service"
              value={laundryType}
              onChange={setLaundryType}
              options={LAUNDRY_TYPES.map((t) => ({ label: TYPE_LABELS[t], value: t }))}
            />
            <TextField label="Special instructions (optional)" value={instructions} onChangeText={setInstructions} placeholder="Separate whites…" />
            <Button label={`Pay ${formatMoney(total)} & book`} onPress={book} loading={booking} />
          </Card>
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  hint: { marginBottom: Spacing.half },
  slotCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
