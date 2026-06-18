import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { Screen, Text, Input, Button } from '@/components/ui';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { theme } from '@/theme';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSignIn() {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
  }

  return (
    <Screen scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Text style={styles.logo}>🛡️</Text>
          <Text variant="display">EvidenceVault</Text>
          <Text tone="muted" style={styles.tagline}>
            A secure, private record of what's happening to you.
          </Text>
        </View>

        {!isSupabaseConfigured && (
          <View style={styles.notice}>
            <Text variant="caption" tone="muted">
              ⚠️ Supabase isn't configured yet. You can browse the app shell, but sign-in
              and cloud sync are disabled until a project is connected.
            </Text>
          </View>
        )}

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            textContentType="emailAddress"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            textContentType="password"
          />
          {error ? (
            <Text tone="danger" variant="caption">
              {error}
            </Text>
          ) : null}
          <Button title="Sign in" onPress={onSignIn} loading={loading} disabled={!isSupabaseConfigured} />
        </View>

        <View style={styles.footer}>
          <Text tone="muted">New here? </Text>
          <Link href="/(auth)/sign-up">
            <Text tone="accent" weight="semibold">
              Create an account
            </Text>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginTop: theme.spacing.xxl, marginBottom: theme.spacing.xl, gap: theme.spacing.xs },
  logo: { fontSize: 56, marginBottom: theme.spacing.sm },
  tagline: { textAlign: 'center', maxWidth: 300, marginTop: theme.spacing.xs },
  notice: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.warning + '55',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  form: { gap: theme.spacing.lg },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: theme.spacing.xl },
});
