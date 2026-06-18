import { useEffect } from 'react';
import { View, StyleSheet, AppState } from 'react-native';
import { useLockStore } from '@/stores/lockStore';
import { theme } from '@/theme';
import { Text } from './ui/Text';
import { Button } from './ui/Button';

/**
 * Full-screen blocker shown whenever the app is locked. Re-locks automatically
 * when the app goes to the background so a glance at the recents view never
 * exposes the vault.
 */
export function LockGate() {
  const { locked, enabled, unlock, lock } = useLockStore();

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') lock();
    });
    return () => sub.remove();
  }, [lock]);

  useEffect(() => {
    if (locked) unlock();
  }, [locked]);

  if (!enabled || !locked) return null;

  return (
    <View style={styles.overlay}>
      <Text style={styles.logo}>🛡️</Text>
      <Text variant="title">EvidenceVault</Text>
      <Text tone="muted" style={styles.sub}>
        Your vault is locked.
      </Text>
      <View style={styles.btn}>
        <Button title="Unlock" icon="🔓" onPress={unlock} fullWidth={false} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    zIndex: 1000,
  },
  logo: { fontSize: 64, marginBottom: theme.spacing.md },
  sub: { marginBottom: theme.spacing.xl },
  btn: { marginTop: theme.spacing.lg },
});
