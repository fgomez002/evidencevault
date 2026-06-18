import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { Screen, Text, Input, Button } from '@/components/ui';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { theme } from '@/theme';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSignUp() {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setDone(true);
  }

  return (
    <Screen scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Text variant="title">Create your vault</Text>
          <Text tone="muted" style={styles.tagline}>
            Your records are private to you and encrypted on this device.
          </Text>
        </View>

        {done ? (
          <View style={styles.notice}>
            <Text>📧 Check your email to confirm your account, then sign in.</Text>
          </View>
        ) : (
          <View style={styles.form}>
            <Input label="Name (optional)" value={name} onChangeText={setName} placeholder="How should we address you?" />
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="At least 8 characters"
              hint="Use a strong, unique password."
            />
            {error ? (
              <Text tone="danger" variant="caption">
                {error}
              </Text>
            ) : null}
            <Button title="Create account" onPress={onSignUp} loading={loading} disabled={!isSupabaseConfigured} />
          </View>
        )}

        <View style={styles.footer}>
          <Text tone="muted">Already have an account? </Text>
          <Link href="/(auth)/sign-in">
            <Text tone="accent" weight="semibold">
              Sign in
            </Text>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: theme.spacing.xxl, marginBottom: theme.spacing.xl, gap: theme.spacing.xs },
  tagline: { maxWidth: 320 },
  notice: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  form: { gap: theme.spacing.lg },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: theme.spacing.xl },
});
