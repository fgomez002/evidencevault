import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { useLockStore } from '@/stores/lockStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { LockGate } from '@/components/LockGate';
import { theme } from '@/theme';
import '@/lib/notifications'; // sets the global notification handler

function RootNavigator() {
  const { session, loading, configured } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const initLock = useLockStore((s) => s.init);
  const initSubscription = useSubscriptionStore((s) => s.init);

  useEffect(() => {
    initLock();
    initSubscription();
  }, [initLock, initSubscription]);

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    // When Supabase isn't configured yet, allow browsing the app shell so the
    // design can be reviewed (PLAN.md §9). Otherwise enforce the auth gate.
    const authed = session != null || !configured;

    if (!authed && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (authed && inAuthGroup) {
      router.replace('/(app)');
    }
  }, [session, loading, configured, segments]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.accent} size="large" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.bg } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
      <LockGate />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <QueryProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bg },
});
