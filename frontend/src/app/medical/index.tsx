import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState, ErrorState, LoadingView } from '@/components/ui/feedback-states';
import { OptionCard } from '@/components/ui/option-card';
import { Screen, listContainerStyle, listContentStyle } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Segmented } from '@/components/ui/segmented';
import { StatusBadge } from '@/components/ui/status-badge';
import { TextField } from '@/components/ui/text-field';
import { MODULES } from '@/constants/modules';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { estimateAppointmentFee, getMedicines, getMyAppointments, MEDICAL_DEPARTMENTS } from '@/services/api/medical';
import { formatDateTime, formatMoney } from '@/utils/format';

const ACCENT = MODULES.find((m) => m.key === 'medical')!.color;

export default function MedicalScreen() {
  const [tab, setTab] = useState<'appointments' | 'pharmacy'>('appointments');

  return (
    <>
      <Stack.Screen options={{ title: 'Medical' }} />
      <View style={[listContainerStyle, styles.tabWrap]}>
        <Segmented
          options={[
            { value: 'appointments', label: 'Appointments' },
            { value: 'pharmacy', label: 'Pharmacy' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </View>
      {tab === 'appointments' ? <AppointmentsTab /> : <PharmacyTab />}
    </>
  );
}

function AppointmentsTab() {
  const theme = { accent: ACCENT };
  const { data: appointments, loading, error, refresh, refreshing } = useAsync(() => getMyAppointments(), []);

  const upcoming = (appointments ?? [])
    .filter((a) => a.status === 'PENDING' || a.status === 'CONFIRMED')
    .sort((a, b) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime())[0];

  return (
    <Screen onRefresh={refresh} refreshing={refreshing} tabInset={false}>
      {loading && <LoadingView />}
      {error && <ErrorState message={error} onRetry={refresh} />}

      {upcoming && (
        <>
          <SectionHeader title="Upcoming" />
          <Card style={{ gap: Spacing.two }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <ThemedText type="smallBold">{upcoming.department}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Dr. {upcoming.doctorName} · Medical Centre
                </ThemedText>
              </View>
              <StatusBadge status={upcoming.status} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.one }}>
              <SymbolView name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }} tintColor={theme.accent} size={16} />
              <ThemedText type="small" style={{ fontWeight: '500' }}>
                {formatDateTime(upcoming.appointmentTime)}
              </ThemedText>
            </View>
          </Card>
        </>
      )}

      <SectionHeader title="Book by department" />
      <View style={styles.deptGrid}>
        {MEDICAL_DEPARTMENTS.map((dept) => (
          <OptionCard
            key={dept}
            label={dept}
            meta={`${formatMoney(estimateAppointmentFee(dept))} fee`}
            selected={false}
            onPress={() => router.push('/medical/appointments')}
          />
        ))}
      </View>

      <Button label="Choose a time" onPress={() => router.push('/medical/appointments')} />
    </Screen>
  );
}

function PharmacyTab() {
  const [search, setSearch] = useState('');
  const { data, loading, error, refresh, refreshing } = useAsync(() => getMedicines(search || undefined), [search]);

  return (
    <>
      <View style={[listContainerStyle, styles.searchWrap]}>
        <TextField
          value={search}
          onChangeText={setSearch}
          placeholder="Search medicines…"
          icon={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
        />
      </View>
      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <FlatList
          style={listContainerStyle}
          contentContainerStyle={listContentStyle()}
          data={(data ?? []).filter((m) => m.active)}
          keyExtractor={(item) => String(item.id)}
          onRefresh={refresh}
          refreshing={refreshing}
          ListEmptyComponent={<EmptyState icon={{ ios: 'pills', android: 'medication', web: 'medication' }} title="No medicines found" />}
          renderItem={({ item }) => (
            <Card style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <ThemedText type="smallBold">{item.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                  {item.description}
                </ThemedText>
                {item.requiresPrescription && (
                  <ThemedText type="small" themeColor="warning">
                    Prescription required
                  </ThemedText>
                )}
              </View>
              <ThemedText type="smallBold">{formatMoney(item.price)}</ThemedText>
            </Card>
          )}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  tabWrap: { alignSelf: 'center', paddingHorizontal: Spacing.four, paddingTop: Spacing.three, paddingBottom: Spacing.two },
  searchWrap: { alignItems: 'center', paddingHorizontal: Spacing.four, paddingBottom: Spacing.two },
  deptGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
});
