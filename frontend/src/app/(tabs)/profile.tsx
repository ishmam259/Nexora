import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { AI_ASSISTANT_COLOR } from '@/constants/modules';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';

const ROLE_LABELS: Record<string, string> = {
  STUDENT: 'Student',
  ADMIN: 'Admin',
  MERCHANT: 'Merchant',
  RESTAURANT_OWNER: 'Restaurant owner',
  DELIVERY_AGENT: 'Delivery agent',
};

function displayRoles(roles: string[]) {
  return roles.filter((r) => ROLE_LABELS[r]).map((r) => ROLE_LABELS[r]);
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const theme = useTheme();
  const [signingOut, setSigningOut] = useState(false);

  const initial = (user?.name ?? user?.username ?? '?').charAt(0).toUpperCase();
  const roles = displayRoles(user?.roles ?? []);

  const confirmSignOut = () => {
    const doSignOut = async () => {
      setSigningOut(true);
      await signOut();
      setSigningOut(false);
    };

    if (Platform.OS === 'web') {
      doSignOut();
      return;
    }
    Alert.alert('Sign out', 'You can sign back in anytime with your Nexora ID.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: doSignOut },
    ]);
  };

  return (
    <Screen tabInset>
      <View style={styles.identity}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <ThemedText style={styles.avatarText}>{initial}</ThemedText>
        </View>
        <ThemedText type="subtitle">{user?.name ?? user?.username}</ThemedText>
        {user?.email && (
          <ThemedText type="small" themeColor="textSecondary">
            {user.email}
          </ThemedText>
        )}
        {roles.length > 0 && (
          <View style={styles.roleRow}>
            {roles.map((role) => (
              <View key={role} style={[styles.rolePill, { backgroundColor: theme.backgroundSelected }]}>
                <ThemedText type="small">{role}</ThemedText>
              </View>
            ))}
          </View>
        )}
      </View>

      <SectionHeader title="More" />
      <View style={styles.linkColumn}>
        <Card onPress={() => router.push('/notifications')} style={styles.linkRow}>
          <View style={styles.linkRowInner}>
            <SymbolView name={{ ios: 'bell.fill', android: 'notifications', web: 'notifications' }} tintColor={theme.text} size={18} />
            <ThemedText>Notifications</ThemedText>
          </View>
          <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} tintColor={theme.textSecondary} size={16} />
        </Card>
        <Card onPress={() => router.push('/ai-assistant')} style={styles.linkRow}>
          <View style={styles.linkRowInner}>
            <SymbolView name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }} tintColor={AI_ASSISTANT_COLOR} size={18} />
            <ThemedText>Ask the Nexora Assistant</ThemedText>
          </View>
          <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} tintColor={theme.textSecondary} size={16} />
        </Card>
        <Card onPress={() => router.push('/marketplace/orders')} style={styles.linkRow}>
          <View style={styles.linkRowInner}>
            <SymbolView name={{ ios: 'bag.fill', android: 'shopping_bag', web: 'shopping_bag' }} tintColor={theme.text} size={18} />
            <ThemedText>My marketplace orders</ThemedText>
          </View>
          <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} tintColor={theme.textSecondary} size={16} />
        </Card>
      </View>

      <View style={styles.signOutWrap}>
        <Card onPress={signingOut ? undefined : confirmSignOut} style={styles.signOutCard}>
          <SymbolView
            name={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' }}
            tintColor={theme.danger}
            size={18}
          />
          <ThemedText style={{ color: theme.danger }}>{signingOut ? 'Signing out…' : 'Sign out'}</ThemedText>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: { alignItems: 'center', gap: Spacing.one, paddingVertical: Spacing.three },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.two },
  avatarText: { color: '#ffffff', fontSize: 28, fontWeight: '700' },
  roleRow: { flexDirection: 'row', gap: Spacing.one, flexWrap: 'wrap', justifyContent: 'center', marginTop: Spacing.one },
  rolePill: { paddingHorizontal: Spacing.two, paddingVertical: Spacing.half, borderRadius: Spacing.five },
  linkColumn: { gap: Spacing.two },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.two },
  linkRowInner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  signOutWrap: { marginTop: Spacing.two },
  signOutCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, justifyContent: 'center' },
});
