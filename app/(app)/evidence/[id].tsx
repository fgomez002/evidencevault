import { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { Screen, Text, Card, Button, SecureBadge } from '@/components/ui';
import { useEvidenceList, useDeleteEvidence, openEvidence } from '@/hooks/useEvidence';
import { evidenceKindMeta, theme } from '@/theme';

export default function EvidenceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: all = [] } = useEvidenceList();
  const del = useDeleteEvidence();
  const file = all.find((e) => e.id === id);
  const [busy, setBusy] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);

  if (!file) {
    return (
      <Screen>
        <Text tone="muted">Evidence not found.</Text>
      </Screen>
    );
  }

  const k = evidenceKindMeta(file.kind);

  async function openAndShare() {
    setBusy(true);
    try {
      const { uri, verified: ok } = await openEvidence(file!);
      setVerified(ok);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Decrypted', ok ? 'File verified and ready.' : 'Warning: hash mismatch.');
      }
    } catch (e) {
      Alert.alert('Could not open', (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function confirmDelete() {
    Alert.alert('Delete evidence?', 'The encrypted file will be permanently removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => del.mutate(file!, { onSuccess: () => router.back() }),
      },
    ]);
  }

  const enc = file.enc_metadata as { algo?: string };

  return (
    <Screen scroll>
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>{k.icon}</Text>
        <Text variant="heading">{file.caption || file.original_filename || k.label}</Text>
        <Text tone="muted" variant="caption">
          {k.label} · {(file.size_bytes / 1024).toFixed(0)} KB
        </Text>
      </View>

      <Card style={styles.block}>
        <Text variant="label" tone="muted">
          🔐 INTEGRITY
        </Text>
        <Row label="Captured" value={new Date(file.captured_at).toLocaleString()} />
        <Row label="Algorithm" value={enc.algo ?? 'xsalsa20-poly1305'} />
        <Row label="SHA-256" value={file.sha256} mono />
        <View style={{ marginTop: theme.spacing.sm }}>
          {verified == null ? (
            <SecureBadge label="Encrypted at rest" />
          ) : (
            <SecureBadge verified={verified} label={verified ? 'Hash verified ✓' : 'Hash MISMATCH'} />
          )}
        </View>
      </Card>

      <View style={styles.actions}>
        <Button
          title={busy ? 'Decrypting…' : 'Open / Share (decrypt)'}
          icon="🔓"
          onPress={openAndShare}
          loading={busy}
        />
        <Button title="Delete evidence" variant="ghost" onPress={confirmDelete} />
      </View>

      {busy && <ActivityIndicator color={theme.colors.accent} style={{ marginTop: theme.spacing.md }} />}
    </Screen>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.row}>
      <Text tone="muted" variant="caption" style={styles.rowLabel}>
        {label}
      </Text>
      <Text variant="caption" style={[styles.rowValue, mono && styles.mono]} numberOfLines={mono ? 2 : 1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 4, marginVertical: theme.spacing.lg },
  heroIcon: { fontSize: 56 },
  block: { gap: theme.spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.lg },
  rowLabel: { width: 80 },
  rowValue: { flex: 1, textAlign: 'right' },
  mono: { fontFamily: 'monospace', fontSize: 11 },
  actions: { marginTop: theme.spacing.xl, gap: theme.spacing.md },
});
