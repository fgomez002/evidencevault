import { View, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, PressableCard, EmptyState, Chip } from '@/components/ui';
import { usePoliceReports } from '@/hooks/usePoliceReports';
import { reportStatusMeta, theme } from '@/theme';

export default function ReportList() {
  const router = useRouter();
  const { data: reports = [], isRefetching, refetch } = usePoliceReports();

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.accent} />}
        renderItem={({ item }) => {
          const s = reportStatusMeta(item.status);
          return (
            <PressableCard style={styles.row} onPress={() => router.push(`/(app)/report/${item.id}`)}>
              <View style={styles.rowText}>
                <Text weight="semibold" numberOfLines={1}>
                  {item.report_number ? `#${item.report_number}` : 'Unnumbered report'}
                </Text>
                <Text tone="muted" variant="caption" numberOfLines={1}>
                  {[item.agency, item.filed_at].filter(Boolean).join(' · ') || 'No agency recorded'}
                </Text>
              </View>
              <Chip label={s.label} color={s.color} selected />
            </PressableCard>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="🚔"
            title="No police reports yet"
            message="Track every report you file: number, agency, officer, and its status over time."
            actionLabel="Add report"
            onAction={() => router.push('/(app)/report/new')}
          />
        }
      />
      <Pressable style={styles.fab} onPress={() => router.push('/(app)/report/new')}>
        <Text style={styles.fabIcon}>＋</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  list: { padding: theme.spacing.lg, paddingBottom: 100 },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md },
  rowText: { flex: 1, gap: 2 },
  fab: {
    position: 'absolute',
    right: theme.spacing.xl,
    bottom: theme.spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  fabIcon: { fontSize: 32, color: theme.colors.accentText, lineHeight: 36 },
});
