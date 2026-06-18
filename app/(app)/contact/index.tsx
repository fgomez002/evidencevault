import { useMemo } from 'react';
import { View, StyleSheet, SectionList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, PressableCard, EmptyState } from '@/components/ui';
import { useContacts } from '@/hooks/useContacts';
import { CONTACT_RELATIONSHIPS, relationshipMeta, theme } from '@/theme';

export default function ContactList() {
  const router = useRouter();
  const { data: contacts = [] } = useContacts();

  const sections = useMemo(() => {
    return CONTACT_RELATIONSHIPS.map((r) => ({
      title: r.label,
      icon: r.icon,
      data: contacts.filter((c) => c.relationship === r.value),
    })).filter((s) => s.data.length > 0);
  }, [contacts]);

  if (contacts.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="📇"
          title="No contacts yet"
          message="Add trusted people — family, friends, attorney, therapist, investigator, and emergency contacts."
          actionLabel="Add contact"
          onAction={() => router.push('/(app)/contact/new')}
        />
        <Fab onPress={() => router.push('/(app)/contact/new')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <Text variant="label" tone="muted" style={styles.section}>
            {section.icon} {section.title.toUpperCase()}
          </Text>
        )}
        renderItem={({ item }) => {
          const r = relationshipMeta(item.relationship);
          return (
            <PressableCard style={styles.row} onPress={() => router.push(`/(app)/contact/${item.id}`)}>
              <View style={[styles.avatar, { backgroundColor: r.color + '33' }]}>
                <Text>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.rowText}>
                <Text weight="semibold" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text tone="muted" variant="caption" numberOfLines={1}>
                  {[item.phone, item.email].filter(Boolean).join(' · ') || 'No contact info'}
                </Text>
              </View>
              {item.is_panic_recipient ? <Text style={styles.panic}>🚨</Text> : null}
            </PressableCard>
          );
        }}
      />
      <Fab onPress={() => router.push('/(app)/contact/new')} />
    </View>
  );
}

function Fab({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.fab} onPress={onPress}>
      <Text style={styles.fabIcon}>＋</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  list: { padding: theme.spacing.lg, paddingBottom: 100 },
  section: { marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm, letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 2 },
  panic: { fontSize: 18 },
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
