import { StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { MODULES } from '@/constants/modules';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { useElevation } from '@/utils/elevation';

export default function LoginScreen() {
  const { signIn, signingIn } = useAuth();
  const theme = useTheme();
  const elevation = useElevation('md');

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={[styles.mark, { backgroundColor: theme.primary }, elevation]}>
            <ThemedText style={styles.markLetter}>N</ThemedText>
          </View>
          <ThemedText type="title" style={styles.wordmark}>
            Nexora
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.tagline}>
            Your campus in one app — marketplace, food, laundry, printing, medical, and more.
          </ThemedText>
        </View>

        <View style={styles.modulePreview}>
          {MODULES.map((mod) => (
            <View
              key={mod.key}
              style={[styles.moduleChip, { backgroundColor: mod.color + '14' }]}
              accessibilityLabel={mod.label}
            >
              <SymbolView name={mod.icon} tintColor={mod.color} size={20} />
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Button label="Sign in with Nexora ID" onPress={signIn} loading={signingIn} />
          <ThemedText type="caption" themeColor="textTertiary" style={styles.footnote}>
            Secured by your university account via Keycloak.
          </ThemedText>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: Spacing.seven,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.seven,
  },
  mark: {
    width: 72,
    height: 72,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  markLetter: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  wordmark: {
    textAlign: 'center',
  },
  tagline: {
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 22,
  },
  modulePreview: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.four,
  },
  moduleChip: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    gap: Spacing.three,
  },
  footnote: {
    textAlign: 'center',
  },
});
