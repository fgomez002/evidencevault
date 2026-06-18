import { View, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, PressableCard, EmptyState } from '@/components/ui';
import { useWitnesses } from '@/hooks/useWitnesses';
import { theme } from '@/theme';

export default function WitnessList() {
  const router = useRouter();
  const { data: witnesses = [], isRefetching, refetch } = useWitnesses();

  return (
    <View style={styles.container}>
      <FlatList
        data={witnesses}
        keyExtractor={(w) => w.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.accent} />}
        renderItem={({ item }) => (
          <PressableCard style={styles.row} onPress={() => router.push(`/(app)/witness/${item.id}`)}>
            <View style={styles.avatar}>
              <Text>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.rowText}>
              <Text weight="semibold" numberOfLines={1}>
                {item.name}
              </Text>
              <Text tone="muted" variant="caption" numberOfLines={1}>
                {[item.phone, item.email].filter(Boolean).join(' · ') || 'No contact info'}
              </Text>
              {item.written_statement ? (
                <Text tone="faint" variant="caption" numberOfLines={1}>
                  “{item.written_statement}”
                </Text>
              ) : null}
            </View>
          </PressableCard>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="🧑‍🤝‍🧑"
            title="No witnesses yet"
            message="Record people who saw what happened, along with their statement and contact info."
            actionLabel="Add witness"
            onAction={() => router.push('/(app)/witness/new')}
          />
        }
      />
      <Pressable style={styles.fab} onPress={() => router.push('/(app)/witness/new')}>
        <Text style={styles.fabIcon}>＋</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  list: { padding: theme.spacing.lg, paddingBottom: 100 },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfacePressed,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
