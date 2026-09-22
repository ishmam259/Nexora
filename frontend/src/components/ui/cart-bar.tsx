import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CartBarProps = {
  count: number;
  label: string;
  amount: string;
  onPress: () => void;
  loading?: boolean;
};

/** Solid accent-filled cart summary bar — matches the `.cartbar` in the design system. */
export function CartBar({ count, label, amount, onPress, loading }: CartBarProps) {
  const theme = useTheme();

  return (
    <SafeAreaView edges={['bottom']} style={{ backgroundColor: theme.background }}>
      <View style={styles.wrap}>
        <Pressable
          onPress={onPress}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={`${label}, total ${amount}`}
          style={({ pressed }) => [styles.bar, { backgroundColor: theme.primary, opacity: pressed ? 0.92 : 1 }]}
        >
          <View style={styles.left}>
            <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <ThemedText type="caption" style={{ color: theme.onPrimary, fontWeight: '700' }}>
                {count}
              </ThemedText>
            </View>
            <ThemedText type="smallBold" style={{ color: theme.onPrimary }}>
              {label}
            </ThemedText>
          </View>
          {loading ? (
            <ActivityIndicator color={theme.onPrimary} />
          ) : (
            <ThemedText type="smallBold" style={{ color: theme.onPrimary, fontVariant: ['tabular-nums'] }}>
              {amount}
            </ThemedText>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: Spacing.three, paddingTop: Spacing.two, paddingBottom: Spacing.two },
  bar: {
    height: 54,
    borderRadius: Radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  badge: { minWidth: 22, height: 22, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
});
