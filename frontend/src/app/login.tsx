import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { MODULES } from '@/constants/modules';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
  const { signIn, signingIn } = useAuth();
  const theme = useTheme();

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={[styles.banner, { backgroundColor: theme.tile }]}>
            <Image
              source={require('@/assets/images/campus-aerial.jpg')}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              contentPosition={{ top: '38%', left: '38%' }}
              accessibilityLabel="Aerial view of the IUT campus"
            />
          </View>

          <View style={styles.brandRow}>
            <View style={[styles.markSmall, { backgroundColor: theme.primary }]}>
              <ThemedText style={styles.markSmallLetter}>N</ThemedText>
            </View>
            <View>
              <ThemedText type="subtitle">Nexora</ThemedText>
              <ThemedText type="caption" themeColor="textSecondary">
                Islamic University of Technology
              </ThemedText>
            </View>
          </View>

          <View style={styles.copyBlock}>
            <ThemedText type="headline" style={styles.headline}>
              Everything on campus, in one app.
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.tagline}>
              Order food, book laundry and printing, see a doctor and trade with classmates.
            </ThemedText>
          </View>
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
          <Button label="Sign in with IUT account" onPress={signIn} loading={signingIn} />
          <ThemedText type="caption" themeColor="textTertiary" style={styles.footnote}>
            Secure single sign-on managed by the university.
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
    gap: Spacing.four,
    marginTop: Spacing.four,
  },
  banner: {
    height: 200,
    borderTopLeftRadius: 130,
    borderTopRightRadius: 130,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    overflow: 'hidden',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  markSmall: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markSmallLetter: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  copyBlock: {
    gap: Spacing.two,
  },
  headline: {
    letterSpacing: -0.3,
  },
  tagline: {
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
