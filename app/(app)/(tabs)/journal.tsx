import { useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Input, EmptyState, Chip } from '@/components/ui';
import { IncidentRow } from '@/components/IncidentRow';
import { useIncidents } from '@/hooks/useIncidents';
import { INCIDENT_CATEGORIES, theme } from '@/theme';

export default function Journal() {
  const router = useRouter();
  const { data: incidents = [], isRefetching, refetch } = useIncidents();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return incidents.filter((i) => {
      if (filter && i.category !== filter) return false;
      if (!q) return true;
      return (
        i.title.toLowerCase().includes(q) ||
        (i.notes ?? '').toLowerCase().includes(q) ||
        (i.location_label ?? '').toLowerCase().includes(q)
      );
    });
  }, [incidents, query, filter]);

  return (
    <View style={styles.container}>
      <View style={styles.head}>
        <Input placeholder="🔍 Search incidents…" value={query} onChangeText={setQuery} />
        <FlatList
          horizontal
          data={INCIDENT_CATEGORIES}
          keyExtractor={(c) => c.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
          renderItem={({ item }) => (
            <Chip
              label={item.label}
              icon={item.icon}
              color={item.color}
              selected={filter === item.value}
              onPress={() => setFilter(filter === item.value ? null : item.value)}
            />
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.accent} />
        }
        renderItem={({ item }) => (
          <IncidentRow incident={item} onPress={() => router.push(`/(app)/incident/${item.id}`)} />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="📓"
            title={incidents.length === 0 ? 'No incidents yet' : 'No matches'}
            message={
              incidents.length === 0
                ? 'Start documenting. Every entry is timestamped and becomes part of your timeline.'
                : 'Try a different search or filter.'
            }
            actionLabel={incidents.length === 0 ? 'Log first incident' : undefined}
            onAction={incidents.length === 0 ? () => router.push('/(app)/incident/new') : undefined}
          />
        }
      />

      <Pressable style={styles.fab} onPress={() => router.push('/(app)/incident/new')}>
        <Text style={styles.fabIcon}>＋</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  head: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, gap: theme.spacing.md },
  filters: { gap: theme.spacing.sm, paddingVertical: theme.spacing.xs },
  list: { padding: theme.spacing.lg, paddingBottom: 100 },
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
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabIcon: { fontSize: 32, color: theme.colors.accentText, lineHeight: 36 },
});
