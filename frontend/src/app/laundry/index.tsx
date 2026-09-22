import { router, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { BottomBar } from '@/components/ui/bottom-bar';
import { Card } from '@/components/ui/card';
import { EmptyState, ErrorState, LoadingView } from '@/components/ui/feedback-states';
import { OptionCard } from '@/components/ui/option-card';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { TextField } from '@/components/ui/text-field';
import { MODULES } from '@/constants/modules';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { createLaundryOrder, estimateLaundryPrice, getSlots, LAUNDRY_TYPES, SlotResponseDto } from '@/services/api/laundry';
import { payWithWallet } from '@/services/api/payment';
import { formatDateTime, formatMoney } from '@/utils/format';

const ACCENT = MODULES.find((m) => m.key === 'laundry')!.color;

const TYPE_LABELS: Record<string, string> = {
  WASH_AND_FOLD: 'Wash & fold',
  DRY_CLEAN: 'Dry clean',
  IRON_ONLY: 'Iron only',
  WASH_AND_IRON: 'Wash & iron',
};

const TYPE_RATES: Record<string, string> = {
  WASH_AND_FOLD: '৳40 / kg',
  WASH_AND_IRON: '৳55 / kg',
  DRY_CLEAN: '৳90 / kg',
  IRON_ONLY: '৳25 / kg',
};

export default function LaundryScreen() {
  const theme = useTheme();
  const { data: slots, loading, error, refresh, refreshing } = useAsync(() => getSlots(), []);
  const [selectedSlot, setSelectedSlot] = useState<SlotResponseDto | null>(null);

  const [weightKg, setWeightKg] = useState(3);
  const [laundryType, setLaundryType] = useState<string>('WASH_AND_FOLD');
  const [instructions, setInstructions] = useState('');
  const [booking, setBooking] = useState(false);

  const total = useMemo(() => estimateLaundryPrice(weightKg, laundryType), [weightKg, laundryType]);

  if (loading) return <LoadingView />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  const book = async () => {
    if (!selectedSlot) {
      Alert.alert('Pick a slot', 'Choose a pickup slot to continue.');
      return;
    }
    setBooking(true);
    try {
      const payment = await payWithWallet(`laundry:slot:${selectedSlot.id}`, total, selectedSlot.label);
      await createLaundryOrder({
        slotId: selectedSlot.id,
        amount: total,
        paymentReference: payment.transactionId,
        weightKg,
        laundryType,
        specialInstructions: instructions.trim(),
      });
      if (Platform.OS === 'web') {
        router.push('/laundry/orders');
      } else {
        Alert.alert('Slot booked', `See you at ${selectedSlot.label}.`, [{ text: 'View orders', onPress: () => router.push('/laundry/orders') }]);
      }
    } catch (err: any) {
      Alert.alert('Booking failed', err?.message ?? 'Please try again.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
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
      <Screen onRefresh={refresh} refreshing={refreshing} tabInset={false}>
        <SectionHeader title="Service" />
        <View style={styles.optionGrid}>
          {LAUNDRY_TYPES.map((t) => (
            <OptionCard
              key={t}
              label={TYPE_LABELS[t]}
              meta={TYPE_RATES[t]}
              selected={laundryType === t}
              onPress={() => setLaundryType(t)}
            />
          ))}
        </View>

        <Card style={styles.weightRow}>
          <View style={{ flex: 1 }}>
            <ThemedText type="smallBold">Weight</ThemedText>
            <ThemedText type="caption" themeColor="textSecondary">
              Estimate — weighed at pickup
            </ThemedText>
          </View>
          <QuantityStepper value={weightKg} onChange={setWeightKg} min={1} max={30} label="weight in kilograms" />
          <ThemedText type="caption" themeColor="textTertiary">
            kg
          </ThemedText>
        </Card>

        <SectionHeader title="Pickup slot" />
        {(slots ?? []).length === 0 && <EmptyState title="No slots available" message="Check back later for open laundry slots." />}
        <Card style={{ padding: 0 }}>
          {(slots ?? []).map((slot, index) => {
            const full = slot.bookedCount >= slot.maxCapacity;
            const selected = selectedSlot?.id === slot.id;
            const fillPct = Math.min(100, Math.round((slot.bookedCount / Math.max(1, slot.maxCapacity)) * 100));
            return (
              <Pressable key={slot.id} disabled={full} onPress={() => setSelectedSlot(slot)}>
                <View
                  style={[
                    styles.slotRow,
                    index > 0 && { borderTopWidth: 1, borderTopColor: theme.borderSubtle },
                    full && { opacity: 0.5 },
                  ]}
                >
                  <View style={{ flex: 1, gap: 6 }}>
                    <View style={styles.slotHeadline}>
                      <ThemedText type="small" style={{ fontWeight: '600' }}>
                        {slot.label} <ThemedText type="caption" themeColor="textSecondary">· {formatDateTime(slot.startTime)}</ThemedText>
                      </ThemedText>
                      <ThemedText type="caption" themeColor={full ? 'danger' : 'textSecondary'}>
                        {full ? 'Full' : `${slot.maxCapacity - slot.bookedCount} left`}
                      </ThemedText>
                    </View>
                    <View style={[styles.progressTrack, { backgroundColor: theme.borderSubtle }]}>
                      <View style={[styles.progressFill, { width: `${fillPct}%`, backgroundColor: theme.primary }]} />
                    </View>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      { borderColor: selected ? theme.primary : theme.border },
                      selected && { borderWidth: 6 },
                    ]}
                  />
                </View>
              </Pressable>
            );
          })}
        </Card>

        <TextField label="Special instructions (optional)" value={instructions} onChangeText={setInstructions} placeholder="Separate whites…" />
      </Screen>

      <BottomBar
        label="Estimated"
        amount={formatMoney(total)}
        ctaLabel="Continue to checkout"
        onPress={book}
        loading={booking}
        disabled={!selectedSlot}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginBottom: Spacing.two },
  weightRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginBottom: Spacing.two },
  slotRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three, minHeight: 60 },
  slotHeadline: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5 },
});
