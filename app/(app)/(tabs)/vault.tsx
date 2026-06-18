import { useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Input, EmptyState, Card, SecureBadge } from '@/components/ui';
import { useEvidenceList } from '@/hooks/useEvidence';
import { evidenceKindMeta, EVIDENCE_KINDS, theme } from '@/theme';

export default function Vault() {
  const router = useRouter();
  const { data: evidence = [], isRefetching, refetch } = useEvidenceList();
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return evidence.filter((e) => {
      if (kind && e.kind !== kind) return false;
      if (!q) return true;
      return (
        (e.caption ?? '').toLowerCase().includes(q) ||
        (e.original_filename ?? '').toLowerCase().includes(q) ||
        e.sha256.includes(q)
      );
    });
  }, [evidence, query, kind]);

  return (
    <View style={styles.container}>
      <View style={styles.head}>
        <Input placeholder="🔍 Search caption, filename, or hash…" value={query} onChangeText={setQuery} />
        <FlatList
          horizontal
          data={EVIDENCE_KINDS}
          keyExtractor={(k) => k.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
          renderItem={({ item }) => {
            const active = kind === item.value;
            return (
              <Pressable
                onPress={() => setKind(active ? null : item.value)}
                style={[styles.kindChip, active && styles.kindChipActive]}
              >
                <Text variant="label" tone={active ? 'default' : 'muted'}>
                  {item.icon} {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(e) => e.id}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.accent} />
        }
        renderItem={({ item }) => {
          const k = evidenceKindMeta(item.kind);
          return (
            <Pressable style={styles.cellWrap} onPress={() => router.push(`/(app)/evidence/${item.id}`)}>
              <Card elevated style={styles.cell}>
                <Text style={styles.cellIcon}>{k.icon}</Text>
                <Text variant="label" numberOfLines={1}>
                  {item.caption || item.original_filename || k.label}
                </Text>
                <Text tone="faint" variant="caption">
                  {new Date(item.captured_at).toLocaleDateString()}
                </Text>
                <View style={styles.badge}>
                  <SecureBadge label="encrypted" />
                </View>
              </Card>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="🔒"
            title={evidence.length === 0 ? 'Your vault is empty' : 'No matches'}
            message={
              evidence.length === 0
                ? 'Add photos, videos, audio, or documents. Each is encrypted and hash-verified.'
                : 'Try a different search or filter.'
            }
            actionLabel={evidence.length === 0 ? 'Add evidence' : undefined}
            onAction={evidence.length === 0 ? () => router.push('/(app)/evidence/add') : undefined}
          />
        }
      />

      <Pressable style={styles.fab} onPress={() => router.push('/(app)/evidence/add')}>
        <Text style={styles.fabIcon}>＋</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  head: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, gap: theme.spacing.md },
  filters: { gap: theme.spacing.sm, paddingVertical: theme.spacing.xs },
  kindChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  kindChipActive: { borderColor: theme.colors.accent, backgroundColor: theme.colors.accent + '22' },
  list: { padding: theme.spacing.lg, paddingBottom: 100 },
  column: { gap: theme.spacing.md },
  cellWrap: { flex: 1, marginBottom: theme.spacing.md },
  cell: { gap: 4, minHeight: 130, justifyContent: 'center' },
  cellIcon: { fontSize: 30 },
  badge: { marginTop: theme.spacing.xs },
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
