import { View, StyleSheet } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { Screen, Text, PressableCard } from '@/components/ui';
import { useWitnesses } from '@/hooks/useWitnesses';
import { usePoliceReports } from '@/hooks/usePoliceReports';
import { useContacts } from '@/hooks/useContacts';
import { useSubscription } from '@/hooks/useSubscription';
import { theme } from '@/theme';

interface Item {
  icon: string;
  title: string;
  subtitle: string;
  href: Href;
  count?: number;
  badge?: string;
}

export default function More() {
  const router = useRouter();
  const { data: witnesses = [] } = useWitnesses();
  const { data: reports = [] } = usePoliceReports();
  const { data: contacts = [] } = useContacts();
  const { isPremium } = useSubscription();

  const records: Item[] = [
    { icon: '🧑‍🤝‍🧑', title: 'Witnesses', subtitle: 'People who saw what happened', href: '/(app)/witness', count: witnesses.length },
    { icon: '🚔', title: 'Police reports', subtitle: 'Track filings, officers, and status', href: '/(app)/report', count: reports.length },
    { icon: '📇', title: 'Contacts', subtitle: 'Trusted people and emergency contacts', href: '/(app)/contact', count: contacts.length },
  ];

  const tools: Item[] = [
    { icon: '🔍', title: 'Smart search', subtitle: 'Search everything by keyword, date, or type', href: '/(app)/search' },
    { icon: '✨', title: 'AI assistant', subtitle: 'Summaries, patterns, attorney-ready reports', href: '/(app)/assistant', badge: 'Premium' },
    { icon: '📄', title: 'Reports & export', subtitle: 'Generate PDF case files and indexes', href: '/(app)/export' },
    { icon: '⏰', title: 'Check-ins', subtitle: 'Safety check-ins with auto-alerts', href: '/(app)/checkin' },
  ];

  return (
    <Screen scroll>
      <Section title="Records">
        {records.map((it) => (
          <Row key={it.title} item={it} onPress={() => router.push(it.href)} />
        ))}
      </Section>

      <Section title="Tools">
        {tools.map((it) => (
          <Row key={it.title} item={it} onPress={() => router.push(it.href)} />
        ))}
      </Section>

      <Section title="App">
        {!isPremium ? (
          <Row
            item={{ icon: '⭐', title: 'Upgrade to Premium', subtitle: 'Unlimited storage, AI, PDF exports', href: '/(app)/paywall' }}
            onPress={() => router.push('/(app)/paywall')}
          />
        ) : null}
        <Row
          item={{ icon: '⚙️', title: 'Settings', subtitle: 'Security, app lock, account', href: '/(app)/settings' }}
          onPress={() => router.push('/(app)/settings')}
        />
      </Section>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="label" tone="muted" style={styles.sectionTitle}>
        {title.toUpperCase()}
      </Text>
      {children}
    </View>
  );
}

function Row({ item, onPress }: { item: Item; onPress: () => void }) {
  return (
    <PressableCard style={styles.row} onPress={onPress}>
      <Text style={styles.icon}>{item.icon}</Text>
      <View style={styles.rowText}>
        <Text weight="semibold">{item.title}</Text>
        <Text tone="muted" variant="caption">
          {item.subtitle}
        </Text>
      </View>
      {item.count != null ? (
        <View style={styles.badge}>
          <Text variant="label" tone="accent">
            {item.count}
          </Text>
        </View>
      ) : item.badge ? (
        <View style={styles.pill}>
          <Text variant="caption" tone="accent">
            {item.badge}
          </Text>
        </View>
      ) : (
        <Text tone="faint">›</Text>
      )}
    </PressableCard>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: theme.spacing.lg },
  sectionTitle: { marginTop: theme.spacing.sm, marginBottom: theme.spacing.md, letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md },
  icon: { fontSize: 26 },
  rowText: { flex: 1, gap: 2 },
  badge: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent + '22',
  },
});
