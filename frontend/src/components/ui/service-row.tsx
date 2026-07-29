import { Pressable, StyleSheet, View } from 'react-native';
import { SymbolView, SymbolViewProps } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MinTouchTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useElevation } from '@/utils/elevation';

export function ServiceRow({
  label,
  tagline,
  icon,
  color,
  onPress,
}: {
  label: string;
  tagline: string;
  icon: SymbolViewProps['name'];
  color: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  const elevation = useElevation('sm');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${tagline}`}
      style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
    >
      <ThemedView
        style={[
          styles.row,
          { borderColor: theme.borderSubtle, backgroundColor: theme.backgroundElement },
          elevation,
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
          <SymbolView name={icon} tintColor={color} size={22} />
        </View>
        <View style={styles.textBlock}>
          <ThemedText type="smallBold">{label}</ThemedText>
          <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
            {tagline}
          </ThemedText>
        </View>
        <SymbolView
          name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
          tintColor={theme.textTertiary}
          size={14}
        />
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    minHeight: MinTouchTarget + 8,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { flex: 1, gap: 2 },
});
