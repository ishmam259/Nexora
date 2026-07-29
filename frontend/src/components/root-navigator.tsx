import { Stack, router, usePathname, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { LoadingView } from '@/components/ui/feedback-states';
import { useAuth } from '@/context/auth-context';

/**
 * Swaps between two independent Stack trees based on auth state. This (rather
 * than a per-screen guard) is the pattern Expo Router recommends: it fully
 * resets navigation state on sign-in/sign-out instead of leaving stale
 * authenticated screens reachable via back-navigation after logout.
 */
export function RootNavigator() {
  const { status } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return;

    const inAuthGroup = segments[0] === 'login';

    if (status === 'signedOut' && !inAuthGroup) {
      router.replace('/login');
    } else if (status === 'signedIn' && inAuthGroup) {
      router.replace('/');
    }
  }, [status, segments, pathname]);

  if (status === 'loading') {
    return <LoadingView />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="marketplace" />
      <Stack.Screen name="food" />
      <Stack.Screen name="laundry" />
      <Stack.Screen name="print" />
      <Stack.Screen name="medical" />
      <Stack.Screen name="lost-found" />
      <Stack.Screen name="conversation" />
      <Stack.Screen name="notifications" options={{ headerShown: true, title: 'Notifications' }} />
      <Stack.Screen name="payments" options={{ headerShown: true, title: 'Payment History' }} />
      <Stack.Screen name="ai-assistant" />
    </Stack>
  );
}
