import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ListRow } from '@/components/ui/list-row';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { AI_ASSISTANT_COLOR } from '@/constants/modules';
import { Radius, Spacing } from '@/constants/theme';
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

  const displayName = user?.name ?? user?.username ?? 'User';
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
      <Card style={styles.identityCard} elevated>
        <Avatar label={displayName} size={72} />
        <View style={styles.identityText}>
          <ThemedText type="headline" style={styles.centered}>
            {displayName}
          </ThemedText>
          {user?.email && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.centered}>
              {user.email}
            </ThemedText>
          )}
          {user?.username && (
            <ThemedText type="caption" themeColor="textTertiary" style={styles.centered}>
              @{user.username}
            </ThemedText>
          )}
        </View>
        {roles.length > 0 && (
          <View style={styles.roleRow}>
            {roles.map((role) => (
              <View key={role} style={[styles.rolePill, { backgroundColor: theme.primaryMuted }]}>
                <ThemedText type="caption" style={{ color: theme.primary }}>
                  {role}
                </ThemedText>
              </View>
            ))}
          </View>
        )}
      </Card>

      <View>
        <SectionHeader title="Account" />
        <View style={styles.linkList}>
          <ListRow
            label="Notifications"
            subtitle="Alerts and order updates"
            icon={{ ios: 'bell.fill', android: 'notifications', web: 'notifications' }}
            onPress={() => router.push('/notifications')}
          />
          <ListRow
            label="Nexora Assistant"
            subtitle="Campus help and recommendations"
            icon={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }}
            iconColor={AI_ASSISTANT_COLOR}
            iconBackground={AI_ASSISTANT_COLOR + '18'}
            onPress={() => router.push('/assistant' as Href)}
          />
          <ListRow
            label="Marketplace auctions"
            subtitle="Bids you won and items you sold"
            icon={{ ios: 'bag.fill', android: 'shopping_bag', web: 'shopping_bag' }}
            onPress={() => router.push('/marketplace/orders')}
          />
        </View>
      </View>

      <ListRow
        label={signingOut ? 'Signing out…' : 'Sign out'}
        icon={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' }}
        destructive
        showChevron={false}
        onPress={() => {
          if (!signingOut) confirmSignOut();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  identityCard: { alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.five },
  identityText: { alignItems: 'center', gap: Spacing.half },
  centered: { textAlign: 'center' },
  roleRow: { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap', justifyContent: 'center' },
  rolePill: { paddingHorizontal: Spacing.two, paddingVertical: Spacing.one, borderRadius: Radius.full },
  linkList: { gap: Spacing.two },
});
