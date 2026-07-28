import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type AvatarProps = {
  label: string;
  size?: number;
  color?: string;
};

export function Avatar({ label, size = 44, color }: AvatarProps) {
  const theme = useTheme();
  const initial = label.charAt(0).toUpperCase();
  const bg = color ?? theme.primary;

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
        },
      ]}
      accessibilityRole="image"
      accessibilityLabel={`Avatar for ${label}`}
    >
      <ThemedText style={[styles.text, { fontSize: size * 0.38 }]}>{initial}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
