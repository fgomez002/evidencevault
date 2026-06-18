import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Card, PressableCard, Button } from '@/components/ui';
import { useIncidents } from '@/hooks/useIncidents';
import { useEvidenceList } from '@/hooks/useEvidence';
import { useAuth } from '@/providers/AuthProvider';
import { theme } from '@/theme';

export default function Home() {
  const router = useRouter();
  const { data: incidents = [] } = useIncidents();
  const { data: evidence = [] } = useEvidenceList();
  const { configured } = useAuth();

  const last7 = incidents.filter(
    (i) => Date.now() - new Date(i.occurred_at).getTime() < 7 * 86400_000,
  ).length;

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View>
          <Text tone="muted" variant="label">
            Your vault
          </Text>
          <Text variant="title">EvidenceVault</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={() => router.push('/(app)/panic')} hitSlop={12} style={styles.panicBtn}>
            <Text weight="bold" style={styles.panicText}>
              🚨 Panic
            </Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(app)/settings')} hitSlop={12}>
            <Text style={styles.gear}>⚙️</Text>
          </Pressable>
        </View>
      </View>

      {!configured && (
        <Card style={styles.demoNotice}>
          <Text variant="label">Demo mode</Text>
          <Text tone="muted" variant="caption" style={{ marginTop: 4 }}>
            Connect a Supabase project to enable accounts, cloud backup, and encrypted sync.
          </Text>
        </Card>
      )}

      <View style={styles.statsRow}>
        <StatCard label="Incidents" value={incidents.length} icon="📓" />
        <StatCard label="Evidence" value={evidence.length} icon="🔒" />
        <StatCard label="Last 7 days" value={last7} icon="🗓️" />
      </View>

      <Text variant="heading" style={styles.sectionTitle}>
        Quick actions
      </Text>
      <View style={styles.actions}>
        <Button title="Log an incident" icon="✏️" onPress={() => router.push('/(app)/incident/new')} />
        <Button
          title="Add evidence"
          icon="📎"
          variant="secondary"
          onPress={() => router.push('/(app)/evidence/add')}
        />
      </View>

      <Text variant="heading" style={styles.sectionTitle}>
        Recent
      </Text>
      {incidents.slice(0, 4).map((i) => (
        <PressableCard
          key={i.id}
          style={styles.recentRow}
          onPress={() => router.push(`/(app)/incident/${i.id}`)}
        >
          <Text weight="semibold" numberOfLines={1}>
            {i.title}
          </Text>
          <Text tone="faint" variant="caption">
            {new Date(i.occurred_at).toLocaleString()}
          </Text>
        </PressableCard>
      ))}
      {incidents.length === 0 && (
        <Text tone="faint" style={{ marginTop: theme.spacing.md }}>
          No incidents logged yet. Tap “Log an incident” to start your record.
        </Text>
      )}
    </Screen>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <Card style={styles.stat} elevated>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text variant="title">{value}</Text>
      <Text tone="muted" variant="caption">
        {label}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  panicBtn: {
    backgroundColor: theme.colors.dangerDim,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
  },
  panicText: { color: '#fff', fontSize: 13 },
  gear: { fontSize: 24 },
  demoNotice: { marginBottom: theme.spacing.lg, borderColor: theme.colors.indigo + '55' },
  statsRow: { flexDirection: 'row', gap: theme.spacing.md },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statIcon: { fontSize: 22, marginBottom: 2 },
  sectionTitle: { marginTop: theme.spacing.xl, marginBottom: theme.spacing.md },
  actions: { gap: theme.spacing.md },
  recentRow: { marginBottom: theme.spacing.md, gap: 4 },
});
