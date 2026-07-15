import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { EmptyState, ErrorState, LoadingView } from '@/components/ui/feedback-states';
import { listContainerStyle, listContentStyle } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { MODULES } from '@/constants/modules';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { getMedicines } from '@/services/api/medical';
import { formatMoney } from '@/utils/format';

const ACCENT = MODULES.find((m) => m.key === 'medical')!.color;

export default function MedicalScreen() {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const { data, loading, error, refresh, refreshing } = useAsync(() => getMedicines(search || undefined), [search]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Medical',
          headerRight: () => (
            <Pressable onPress={() => router.push('/medical/appointments')} hitSlop={8}>
              <SymbolView name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }} tintColor={ACCENT} size={20} />
            </Pressable>
          ),
        }}
      />
      <View style={[listContainerStyle, { alignSelf: 'center', paddingHorizontal: Spacing.four, paddingTop: Spacing.three }]}>
        <TextField value={search} onChangeText={setSearch} placeholder="Search medicines…" />
        <Pressable onPress={() => router.push('/medical/appointments')} style={{ marginTop: Spacing.two }}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
              <SymbolView name={{ ios: 'stethoscope', android: 'stethoscope', web: 'stethoscope' }} tintColor={ACCENT} size={18} />
              <ThemedText type="smallBold">{"Book a doctor's appointment"}</ThemedText>
            </View>
            <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} tintColor={theme.textSecondary} size={16} />
          </Card>
        </Pressable>
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
              <ThemedText type="smallBold" style={{ color: ACCENT }}>
                {formatMoney(item.price)}
              </ThemedText>
            </Card>
          )}
        />
      )}
    </>
  );
}
