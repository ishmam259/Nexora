import { StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { MODULES } from '@/constants/modules';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
  const { signIn, signingIn } = useAuth();
  const theme = useTheme();

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={[styles.mark, { backgroundColor: theme.primary }]}>
            <ThemedText style={styles.markLetter}>N</ThemedText>
          </View>
          <ThemedText type="title" style={styles.wordmark}>
            Nexora
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.tagline}>
            One sign-in for everything on campus — marketplace, food, laundry, printing, medical, and more.
          </ThemedText>
        </View>

        <View style={styles.chipRow}>
          {MODULES.map((mod) => (
            <View key={mod.key} style={[styles.chip, { backgroundColor: mod.color + '26' }]}>
              <SymbolView name={mod.icon} tintColor={mod.color} size={18} />
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Button label="Sign in with Nexora ID" onPress={signIn} loading={signingIn} />
          <ThemedText type="small" themeColor="textSecondary" style={styles.footnote}>
            Uses your university account. Managed by campus IT via Keycloak.
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
    paddingVertical: Spacing.six,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.six,
  },
  mark: {
    width: 64,
    height: 64,
    borderRadius: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  markLetter: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
  },
  wordmark: {
    textAlign: 'center',
  },
  tagline: {
    textAlign: 'center',
    maxWidth: 320,
  },
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.four,
  },
  chip: {
    width: 44,
    height: 44,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    gap: Spacing.two,
  },
  footnote: {
    textAlign: 'center',
  },
});
