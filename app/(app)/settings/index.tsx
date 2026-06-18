import { View, StyleSheet, Switch, Alert } from 'react-native';
import { Screen, Text, Card, Button } from '@/components/ui';
import { useLockStore } from '@/stores/lockStore';
import { useAuth } from '@/providers/AuthProvider';
import { theme } from '@/theme';

export default function Settings() {
  const { enabled, supported, setEnabled } = useLockStore();
  const { signOut, session, configured } = useAuth();

  return (
    <Screen scroll>
      <Text variant="label" tone="muted" style={styles.section}>
        SECURITY
      </Text>
      <Card>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text weight="semibold">Biometric app lock</Text>
            <Text tone="muted" variant="caption">
              {supported
                ? 'Require Face ID / fingerprint to open the vault.'
                : 'No biometrics enrolled on this device.'}
            </Text>
          </View>
          <Switch
            value={enabled}
            disabled={!supported}
            onValueChange={(v) => setEnabled(v)}
            trackColor={{ true: theme.colors.accentDim, false: theme.colors.border }}
            thumbColor={enabled ? theme.colors.accent : theme.colors.textFaint}
          />
        </View>
      </Card>

      <Card style={styles.infoCard}>
        <Text variant="label">🔐 How your data is protected</Text>
        <Text tone="muted" variant="caption" style={styles.infoText}>
          Evidence files are encrypted on this device before upload — the server only
          stores ciphertext. Each file is fingerprinted with SHA-256 the moment it's
          captured to preserve a verifiable chain of custody.
        </Text>
      </Card>

      <Text variant="label" tone="muted" style={styles.section}>
        ACCOUNT
      </Text>
      <Card>
        <Text weight="semibold">{session?.user.email ?? (configured ? 'Signed in' : 'Demo mode')}</Text>
        <Text tone="muted" variant="caption">
          Plan: Free
        </Text>
      </Card>

      <View style={styles.signOut}>
        <Button
          title="Sign out"
          variant="secondary"
          disabled={!configured}
          onPress={() =>
            Alert.alert('Sign out?', 'You can sign back in anytime.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign out', style: 'destructive', onPress: signOut },
            ])
          }
        />
      </View>

      <Text tone="faint" variant="caption" style={styles.disclaimer}>
        EvidenceVault is a documentation tool, not legal advice or an emergency service.
        In an emergency, contact your local emergency number.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm, letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md },
  rowText: { flex: 1, gap: 2 },
  infoCard: { marginTop: theme.spacing.md, gap: theme.spacing.xs },
  infoText: { lineHeight: 18 },
  signOut: { marginTop: theme.spacing.xl },
  disclaimer: { marginTop: theme.spacing.xl, textAlign: 'center', lineHeight: 16 },
});
