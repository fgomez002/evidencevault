import { View, StyleSheet } from 'react-native';
import { PressableCard, Text } from '@/components/ui';
import { categoryMeta, theme } from '@/theme';
import type { Incident } from '@/lib/database.types';

export function IncidentRow({ incident, onPress }: { incident: Incident; onPress: () => void }) {
  const cat = categoryMeta(incident.category);
  return (
    <PressableCard style={styles.card} onPress={onPress}>
      <View style={[styles.bar, { backgroundColor: cat.color }]} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text weight="semibold" numberOfLines={1} style={styles.title}>
            {incident.title}
          </Text>
          <Text style={styles.catIcon}>{cat.icon}</Text>
        </View>
        <Text tone="muted" variant="caption">
          {cat.label} · {new Date(incident.occurred_at).toLocaleString()}
        </Text>
        {incident.notes ? (
          <Text tone="faint" variant="caption" numberOfLines={2} style={styles.notes}>
            {incident.notes}
          </Text>
        ) : null}
        {incident.location_label ? (
          <Text tone="faint" variant="caption" style={styles.loc}>
            📍 {incident.location_label}
          </Text>
        ) : null}
      </View>
    </PressableCard>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', padding: 0, marginBottom: theme.spacing.md, overflow: 'hidden' },
  bar: { width: 4 },
  body: { flex: 1, padding: theme.spacing.lg, gap: 3 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm },
  title: { flex: 1 },
  catIcon: { fontSize: 16 },
  notes: { marginTop: 2 },
  loc: { marginTop: 2 },
});
