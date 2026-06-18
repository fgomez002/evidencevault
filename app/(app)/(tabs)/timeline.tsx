import { useMemo } from 'react';
import { View, StyleSheet, SectionList } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, EmptyState } from '@/components/ui';
import { useIncidents } from '@/hooks/useIncidents';
import { useEvidenceList } from '@/hooks/useEvidence';
import { categoryMeta, evidenceKindMeta, theme } from '@/theme';

type TimelineItem =
  | { type: 'incident'; id: string; at: string; title: string; category: string }
  | { type: 'evidence'; id: string; at: string; title: string; kind: string };

export default function Timeline() {
  const router = useRouter();
  const { data: incidents = [] } = useIncidents();
  const { data: evidence = [] } = useEvidenceList();

  const sections = useMemo(() => {
    const items: TimelineItem[] = [
      ...incidents.map((i) => ({
        type: 'incident' as const,
        id: i.id,
        at: i.occurred_at,
        title: i.title,
        category: i.category,
      })),
      ...evidence.map((e) => ({
        type: 'evidence' as const,
        id: e.id,
        at: e.captured_at,
        title: e.caption || e.original_filename || evidenceKindMeta(e.kind).label,
        kind: e.kind,
      })),
    ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

    // group by month-year
    const groups: Record<string, TimelineItem[]> = {};
    for (const it of items) {
      const d = new Date(it.at);
      const key = d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
      (groups[key] ??= []).push(it);
    }
    return Object.entries(groups).map(([title, data]) => ({ title, data }));
  }, [incidents, evidence]);

  if (sections.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="📈"
          title="Your timeline is empty"
          message="As you log incidents and add evidence, they appear here in one chronological view — invaluable when reviewing months or years of records."
        />
      </View>
    );
  }

  return (
    <SectionList
      style={styles.container}
      contentContainerStyle={styles.content}
      sections={sections}
      keyExtractor={(item) => item.type + item.id}
      stickySectionHeadersEnabled={false}
      renderSectionHeader={({ section }) => (
        <Text variant="label" tone="accent" style={styles.month}>
          {section.title.toUpperCase()}
        </Text>
      )}
      renderItem={({ item }) => {
        const isIncident = item.type === 'incident';
        const meta = isIncident ? categoryMeta(item.category) : evidenceKindMeta(item.kind);
        const dotColor = isIncident ? categoryMeta(item.category).color : theme.colors.accent;
        return (
          <View style={styles.row}>
            <View style={styles.gutter}>
              <View style={[styles.dot, { backgroundColor: dotColor }]} />
              <View style={styles.line} />
            </View>
            <Text
              style={styles.itemBody}
              onPress={() =>
                router.push(
                  isIncident ? `/(app)/incident/${item.id}` : `/(app)/evidence/${item.id}`,
                )
              }
            >
              <Text style={styles.itemIcon}>{meta.icon} </Text>
              <Text weight="semibold">{item.title}</Text>
              {'\n'}
              <Text tone="faint" variant="caption">
                {isIncident ? 'Incident' : 'Evidence'} ·{' '}
                {new Date(item.at).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </Text>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  month: { marginTop: theme.spacing.lg, marginBottom: theme.spacing.md, letterSpacing: 1 },
  row: { flexDirection: 'row', gap: theme.spacing.md },
  gutter: { alignItems: 'center', width: 16 },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  line: { flex: 1, width: 2, backgroundColor: theme.colors.border, marginVertical: 2 },
  itemBody: {
    flex: 1,
    paddingBottom: theme.spacing.lg,
    color: theme.colors.text,
    lineHeight: 22,
  },
  itemIcon: { fontSize: 15 },
});
