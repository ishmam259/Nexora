import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SymbolView, SymbolViewProps } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { MinTouchTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ListRowProps = {
  label: string;
  subtitle?: string;
  icon?: SymbolViewProps['name'];
  iconColor?: string;
  iconBackground?: string;
  onPress: () => void;
  showChevron?: boolean;
  trailing?: ReactNode;
  destructive?: boolean;
};

export function ListRow({
  label,
  subtitle,
  icon,
  iconColor,
  iconBackground,
  onPress,
  showChevron = true,
  trailing,
  destructive,
}: ListRowProps) {
  const theme = useTheme();
  const tint = iconColor ?? (destructive ? theme.danger : theme.text);
  const iconBg = iconBackground ?? (destructive ? theme.dangerMuted : theme.backgroundSelected);

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={subtitle ? `${label}, ${subtitle}` : label}
      style={styles.row}
    >
      {icon && (
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
          <SymbolView name={icon} tintColor={tint} size={20} />
        </View>
      )}
      <View style={styles.textBlock}>
        <ThemedText type="smallBold" style={destructive ? { color: theme.danger } : undefined}>
          {label}
        </ThemedText>
        {subtitle && (
          <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
            {subtitle}
          </ThemedText>
        )}
      </View>
      {trailing ?? (
        showChevron && (
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            tintColor={theme.textTertiary}
            size={14}
          />
        )
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: MinTouchTarget,
    paddingVertical: Spacing.two,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { flex: 1, gap: 2 },
});
