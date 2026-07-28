import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { parseAppLinks } from '@/constants/navigation';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AiMessageProps = {
  text: string;
  isUser?: boolean;
};

/**
 * Renders assistant text and turns markdown app links like [Food](/food)
 * into tappable chips that navigate inside the Expo Router app.
 */
export function AiMessage({ text, isUser = false }: AiMessageProps) {
  const theme = useTheme();
  const segments = parseAppLinks(text);
  const textColor = isUser ? theme.onPrimary : theme.text;

  if (isUser) {
    return (
      <ThemedText type="small" style={{ color: textColor }}>
        {text}
      </ThemedText>
    );
  }

  const links = segments.filter((s) => s.type === 'link');

  return (
    <View style={styles.wrap}>
      <Text style={[styles.body, { color: textColor, fontFamily: Fonts.sans }]}>
        {segments.map((segment, index) => {
          if (segment.type === 'text') {
            return <Text key={index}>{segment.value}</Text>;
          }
          return (
            <Text key={index} style={{ color: theme.primary, fontWeight: '700' }}>
              {segment.label}
            </Text>
          );
        })}
      </Text>

      {links.length > 0 && (
        <View style={styles.chipRow}>
          {links.map((link, index) =>
            link.type === 'link' ? (
              <Pressable
                key={`${link.path}-${index}`}
                onPress={() => router.push(link.path as Href)}
                accessibilityRole="link"
                accessibilityLabel={`Go to ${link.label}`}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: theme.primaryMuted,
                    borderColor: theme.primary + '44',
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <SymbolView
                  name={{ ios: 'arrow.up.right', android: 'open_in_new', web: 'open_in_new' }}
                  tintColor={theme.primary}
                  size={12}
                />
                <ThemedText type="caption" style={{ color: theme.primary, fontWeight: '700' }}>
                  {link.label}
                </ThemedText>
              </Pressable>
            ) : null
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.two },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.one + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
});
