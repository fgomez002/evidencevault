import { useMemo, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { Screen, Text, Input, PressableCard, EmptyState } from '@/components/ui';
import { useIncidents } from '@/hooks/useIncidents';
import { useEvidenceList } from '@/hooks/useEvidence';
import { useWitnesses } from '@/hooks/useWitnesses';
import { usePoliceReports } from '@/hooks/usePoliceReports';
import { categoryMeta, evidenceKindMeta, theme } from '@/theme';

interface Hit {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  href: Href;
  date: string;
}

export default function SmartSearch() {
  const router = useRouter();
  const { data: incidents = [] } = useIncidents();
  const { data: evidence = [] } = useEvidenceList();
  const { data: witnesses = [] } = useWitnesses();
  const { data: reports = [] } = usePoliceReports();
  const [query, setQuery] = useState('');

  const hits = useMemo<Hit[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const out: Hit[] = [];

    for (const i of incidents) {
      const hay = [i.title, i.notes, i.location_label, i.emotional_impact, i.follow_up_actions, i.category]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (hay.includes(q)) {
        out.push({
          id: 'i' + i.id,
          icon: categoryMeta(i.category).icon,
          title: i.title,
          subtitle: `Incident · ${categoryMeta(i.category).label}`,
          href: `/(app)/incident/${i.id}`,
          date: i.occurred_at,
        });
      }
    }
    for (const e of evidence) {
      const hay = [e.caption, e.original_filename, e.kind, e.sha256].filter(Boolean).join(' ').toLowerCase();
      if (hay.includes(q)) {
        out.push({
          id: 'e' + e.id,
          icon: evidenceKindMeta(e.kind).icon,
          title: e.caption || e.original_filename || evidenceKindMeta(e.kind).label,
          subtitle: `Evidence · ${evidenceKindMeta(e.kind).label}`,
          href: `/(app)/evidence/${e.id}`,
          date: e.captured_at,
        });
      }
    }
    for (const w of witnesses) {
      const hay = [w.name, w.phone, w.email, w.written_statement, w.notes].filter(Boolean).join(' ').toLowerCase();
      if (hay.includes(q)) {
        out.push({
          id: 'w' + w.id,
          icon: '🧑',
          title: w.name,
          subtitle: 'Witness',
          href: `/(app)/witness/${w.id}`,
          date: w.created_at,
        });
      }
    }
    for (const r of reports) {
      const hay = [r.report_number, r.agency, r.officer_name, r.officer_badge, r.follow_up_notes]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (hay.includes(q)) {
        out.push({
          id: 'r' + r.id,
          icon: '🚔',
          title: r.report_number ? `#${r.report_number}` : 'Police report',
          subtitle: `Police report · ${r.agency ?? ''}`.trim(),
          href: `/(app)/report/${r.id}`,
          date: r.created_at,
        });
      }
    }

    return out.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [query, incidents, evidence, witnesses, reports]);

  return (
    <Screen padded={false}>
      <View style={styles.head}>
        <Input
          placeholder="🔍 Person, place, vehicle, plate, keyword…"
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
        {query.trim() ? (
          <Text tone="faint" variant="caption" style={styles.count}>
            {hits.length} result{hits.length === 1 ? '' : 's'} across all records
          </Text>
        ) : null}
      </View>

      <FlatList
        data={hits}
        keyExtractor={(h) => h.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <PressableCard style={styles.row} onPress={() => router.push(item.href)}>
            <Text style={styles.icon}>{item.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text weight="semibold" numberOfLines={1}>
                {item.title}
              </Text>
              <Text tone="muted" variant="caption">
                {item.subtitle} · {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
          </PressableCard>
        )}
        ListEmptyComponent={
          query.trim() ? (
            <EmptyState icon="🔍" title="No matches" message="Try a different name, place, or keyword." />
          ) : (
            <EmptyState
              icon="🔍"
              title="Search everything"
              message="One search across incidents, evidence, witnesses, and police reports — by person, location, vehicle, license plate, or any keyword."
            />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, gap: theme.spacing.sm },
  count: { marginLeft: theme.spacing.xs },
  list: { padding: theme.spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md },
  icon: { fontSize: 24 },
});
