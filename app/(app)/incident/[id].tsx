import { View, StyleSheet, Alert, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Screen, Text, Card, Button, Chip, SecureBadge } from '@/components/ui';
import { useIncident, useDeleteIncident } from '@/hooks/useIncidents';
import { useEvidenceList } from '@/hooks/useEvidence';
import { categoryMeta, evidenceKindMeta, theme } from '@/theme';

export default function IncidentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: incident, isLoading } = useIncident(id);
  const { data: allEvidence = [] } = useEvidenceList();
  const del = useDeleteIncident();

  if (isLoading || !incident) {
    return (
      <Screen>
        <Text tone="muted">Loading…</Text>
      </Screen>
    );
  }

  const cat = categoryMeta(incident.category);
  const linkedEvidence = allEvidence.filter((e) => e.incident_id === incident.id);

  function confirmDelete() {
    Alert.alert('Delete incident?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => del.mutate(id!, { onSuccess: () => router.back() }),
      },
    ]);
  }

  return (
    <Screen scroll>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => router.push(`/(app)/incident/edit/${id}`)} hitSlop={10}>
              <Text tone="accent" weight="semibold">
                Edit
              </Text>
            </Pressable>
          ),
        }}
      />

      <View style={styles.titleRow}>
        <Chip label={cat.label} icon={cat.icon} color={cat.color} selected />
      </View>
      <Text variant="title" style={styles.title}>
        {incident.title}
      </Text>
      <Text tone="muted" variant="caption">
        🕒 {new Date(incident.occurred_at).toLocaleString()}
      </Text>

      {incident.location_label || incident.latitude != null ? (
        <Card style={styles.block}>
          <Text variant="label" tone="muted">
            📍 LOCATION
          </Text>
          <Text style={styles.blockBody}>
            {incident.location_label ??
              `${incident.latitude?.toFixed(5)}, ${incident.longitude?.toFixed(5)}`}
          </Text>
        </Card>
      ) : null}

      {incident.notes ? <Section title="WHAT HAPPENED" body={incident.notes} /> : null}
      {incident.emotional_impact ? <Section title="EMOTIONAL IMPACT" body={incident.emotional_impact} /> : null}
      {incident.follow_up_actions ? <Section title="FOLLOW-UP ACTIONS" body={incident.follow_up_actions} /> : null}

      <View style={styles.evidenceHead}>
        <Text variant="heading">Evidence ({linkedEvidence.length})</Text>
        <Pressable onPress={() => router.push({ pathname: '/(app)/evidence/add', params: { incidentId: id } })}>
          <Text tone="accent" weight="semibold">
            + Attach
          </Text>
        </Pressable>
      </View>
      {linkedEvidence.map((e) => {
        const k = evidenceKindMeta(e.kind);
        return (
          <Card key={e.id} style={styles.evRow}>
            <Text style={styles.evIcon}>{k.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text weight="semibold" numberOfLines={1}>
                {e.caption || e.original_filename || k.label}
              </Text>
              <SecureBadge label={`SHA-256 ${e.sha256.slice(0, 10)}…`} />
            </View>
          </Card>
        );
      })}
      {linkedEvidence.length === 0 && (
        <Text tone="faint" variant="caption">
          No evidence attached yet.
        </Text>
      )}

      <View style={styles.delete}>
        <Button title="Delete incident" variant="ghost" onPress={confirmDelete} />
      </View>
    </Screen>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <Card style={styles.block}>
      <Text variant="label" tone="muted">
        {title}
      </Text>
      <Text style={styles.blockBody}>{body}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', marginBottom: theme.spacing.md },
  title: { marginBottom: theme.spacing.xs },
  block: { marginTop: theme.spacing.lg, gap: theme.spacing.xs },
  blockBody: { lineHeight: 22 },
  evidenceHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  evRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md },
  evIcon: { fontSize: 24 },
  delete: { marginTop: theme.spacing.xxl },
});
