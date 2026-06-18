import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { theme } from '@/theme';

/**
 * Entry route. Bounces to the app shell or the auth flow. When Supabase isn't
 * configured we allow the app shell through so the UI can be reviewed.
 */
export default function Index() {
  const { session, loading, configured } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.accent} size="large" />
      </View>
    );
  }

  const authed = session != null || !configured;
  return <Redirect href={authed ? '/(app)' : '/(auth)/sign-in'} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bg },
});
