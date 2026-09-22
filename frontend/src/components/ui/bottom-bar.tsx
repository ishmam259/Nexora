import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type BottomBarProps = {
  label: string;
  amount: string;
  ctaLabel: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  extra?: ReactNode;
};

/** Sticky total + CTA bar matching the `.bar2` checkout footer in the design system. */
export function BottomBar({ label, amount, ctaLabel, onPress, loading, disabled, extra }: BottomBarProps) {
  const theme = useTheme();

  return (
    <SafeAreaView edges={['bottom']} style={[styles.safe, { backgroundColor: theme.backgroundElement, borderTopColor: theme.border }]}>
      <View style={styles.row}>
        {extra}
        <View style={styles.totals}>
          <ThemedText type="caption" themeColor="textSecondary">
            {label}
          </ThemedText>
          <ThemedText type="subtitle" style={styles.amount}>
            {amount}
          </ThemedText>
        </View>
        <Button label={ctaLabel} onPress={onPress} loading={loading} disabled={disabled} style={styles.cta} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { borderTopWidth: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  totals: { gap: 2 },
  amount: { fontVariant: ['tabular-nums'] },
  cta: { flex: 1 },
});
