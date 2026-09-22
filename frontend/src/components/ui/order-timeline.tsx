import { StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export type TimelineStep = {
  label: string;
  time?: string;
  state: 'done' | 'current' | 'upcoming';
};

/** Dot-and-line status stepper matching the order tracking screen in the design system. */
export function OrderTimeline({ steps }: { steps: TimelineStep[] }) {
  const theme = useTheme();

  return (
    <View>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const dotColor = step.state === 'done' ? theme.success : theme.border;
        return (
          <View key={step.label} style={styles.row}>
            <View style={styles.dotColumn}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: step.state === 'done' ? theme.success : theme.backgroundElement,
                    borderColor: step.state === 'current' ? theme.primary : dotColor,
                    borderWidth: step.state === 'current' ? 2 : 2,
                  },
                ]}
              >
                {step.state === 'done' && (
                  <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} tintColor="#FFFFFF" size={12} />
                )}
                {step.state === 'current' && <View style={[styles.innerDot, { backgroundColor: theme.primary }]} />}
              </View>
              {!isLast && (
                <View style={[styles.line, { backgroundColor: step.state === 'done' ? theme.success : theme.border }]} />
              )}
            </View>
            <View style={styles.textRow}>
              <ThemedText
                type={step.state === 'current' ? 'smallBold' : 'small'}
                themeColor={step.state === 'upcoming' ? 'textTertiary' : 'text'}
              >
                {step.label}
              </ThemedText>
              {step.time && (
                <ThemedText type="caption" themeColor="textTertiary" style={styles.time}>
                  {step.time}
                </ThemedText>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14 },
  dotColumn: { alignItems: 'center' },
  dot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  innerDot: { width: 9, height: 9, borderRadius: 4.5 },
  line: { width: 2, flex: 1, minHeight: 16 },
  textRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 14,
  },
  time: { fontVariant: ['tabular-nums'] },
});
