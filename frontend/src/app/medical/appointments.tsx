import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/feedback-states';
import { Screen } from '@/components/ui/screen';
import { SelectField } from '@/components/ui/select-field';
import { StatusBadge } from '@/components/ui/status-badge';
import { TextField } from '@/components/ui/text-field';
import { MODULES } from '@/constants/modules';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { createAppointment, estimateAppointmentFee, getMyAppointments, MEDICAL_DEPARTMENTS } from '@/services/api/medical';
import { payWithWallet } from '@/services/api/payment';
import { formatDateTime, formatMoney } from '@/utils/format';

const ACCENT = MODULES.find((m) => m.key === 'medical')!.color;

export default function AppointmentsScreen() {
  const { data: appointments, error, refresh, refreshing } = useAsync(() => getMyAppointments(), []);

  const [doctorName, setDoctorName] = useState('');
  const [department, setDepartment] = useState<string | null>(null);
  const [appointmentTime, setAppointmentTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [booking, setBooking] = useState(false);

  const fee = useMemo(() => estimateAppointmentFee(department ?? 'General Medicine'), [department]);

  const book = async () => {
    if (!doctorName.trim() || !department) {
      Alert.alert('Missing details', 'Add the doctor or department, and pick a time.');
      return;
    }
    const parsed = new Date(appointmentTime);
    if (Number.isNaN(parsed.getTime())) {
      Alert.alert('Invalid time', 'Use the format YYYY-MM-DDTHH:mm, e.g. 2026-07-16T10:00');
      return;
    }
    setBooking(true);
    try {
      // The appointment DTO has no paymentReference field — the wallet charge
      // itself is the record of payment for this order type.
      await payWithWallet(`medical:appointment:${Date.now()}`, fee, `${department} with ${doctorName}`);
      await createAppointment({
        doctorName: doctorName.trim(),
        department,
        appointmentTime: parsed.toISOString().slice(0, 19),
        amount: fee,
        symptoms: symptoms.trim(),
      });
      setDoctorName('');
      setDepartment(null);
      setAppointmentTime('');
      setSymptoms('');
      refresh();
    } catch (err: any) {
      Alert.alert('Booking failed', err?.message ?? 'Please try again.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <Screen onRefresh={refresh} refreshing={refreshing} tabInset>
      <Stack.Screen options={{ title: 'Appointments' }} />

      <Card style={{ gap: Spacing.two }}>
        <ThemedText type="smallBold">Book an appointment</ThemedText>
        <TextField label="Doctor's name" value={doctorName} onChangeText={setDoctorName} placeholder="Dr. Rahman" />
        <SelectField label="Department" value={department} onChange={setDepartment} options={MEDICAL_DEPARTMENTS.map((d) => ({ label: d, value: d }))} />
        <TextField
          label="Preferred time"
          value={appointmentTime}
          onChangeText={setAppointmentTime}
          placeholder="2026-07-16T10:00"
          autoCapitalize="none"
        />
        <TextField label="Symptoms (optional)" value={symptoms} onChangeText={setSymptoms} placeholder="Fever, headache…" multiline />
        <Button label={`Pay ${formatMoney(fee)} & book`} onPress={book} loading={booking} />
      </Card>

      <ThemedText type="subtitle" style={{ marginTop: Spacing.two }}>
        My appointments
      </ThemedText>
      {error && <ErrorState message={error} onRetry={refresh} />}
      {(appointments ?? []).map((appt) => (
        <Card key={appt.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ThemedText type="smallBold">{appt.doctorName}</ThemedText>
            <ThemedText type="smallBold" style={{ color: ACCENT }}>
              {formatMoney(appt.amount)}
            </ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {appt.department} · {formatDateTime(appt.appointmentTime)}
          </ThemedText>
          {!!appt.prescriptionDetails && (
            <ThemedText type="small" themeColor="textSecondary">
              Prescription: {appt.prescriptionDetails}
            </ThemedText>
          )}
          <View style={{ marginTop: Spacing.one }}>
            <StatusBadge status={appt.status} />
          </View>
        </Card>
      ))}
    </Screen>
  );
}
