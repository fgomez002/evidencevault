import { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Card, Button, PressableCard } from '@/components/ui';
import { useIncidents } from '@/hooks/useIncidents';
import { useEvidenceList } from '@/hooks/useEvidence';
import { useAiAssistant, buildContext, AiTask } from '@/hooks/useAiAssistant';
import { useSubscription } from '@/hooks/useSubscription';
import { isSupabaseConfigured } from '@/lib/supabase';
import { theme } from '@/theme';

const TASKS: { task: AiTask; icon: string; title: string; subtitle: string }[] = [
  { task: 'summarize', icon: '📝', title: 'Summarize incidents', subtitle: 'A concise narrative overview of your records' },
  { task: 'patterns', icon: '🔎', title: 'Detect patterns', subtitle: 'Recurring people, vehicles, times, escalation' },
  { task: 'report', icon: '⚖️', title: 'Attorney-ready report', subtitle: 'Structured chronological case summary' },
];

export default function Assistant() {
  const router = useRouter();
  const { data: incidents = [] } = useIncidents();
  const { data: evidence = [] } = useEvidenceList();
  const { isPremium } = useSubscription();
  const ai = useAiAssistant();
  const [result, setResult] = useState<string | null>(null);
  const [active, setActive] = useState<AiTask | null>(null);

  function run(task: AiTask) {
    setActive(task);
    setResult(null);
    const context = buildContext(incidents, evidence);
    ai.mutate(
      { task, context },
      {
        onSuccess: (text) => setResult(text),
        onError: (e) => setResult(`⚠️ ${(e as Error).message}`),
      },
    );
  }

  if (!isPremium) {
    return (
      <Screen scroll>
        <View style={styles.lock}>
          <Text style={styles.lockIcon}>✨</Text>
          <Text variant="heading" style={styles.center}>
            AI assistant is a Premium feature
          </Text>
          <Text tone="muted" style={styles.center}>
            Summaries, pattern detection, and attorney-ready reports are part of EvidenceVault Premium.
          </Text>
          <View style={{ marginTop: theme.spacing.lg }}>
            <Button title="See Premium" icon="⭐" onPress={() => router.push('/(app)/paywall')} fullWidth={false} />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Card style={styles.consent}>
        <Text variant="label">🔐 How this works</Text>
        <Text tone="muted" variant="caption" style={{ marginTop: 4, lineHeight: 18 }}>
          To analyze your records, EvidenceVault sends the text of your incidents and evidence
          captions to a secure AI service. Files themselves are never sent. Run a task only when
          you're comfortable with that.
        </Text>
      </Card>

      {!isSupabaseConfigured && (
        <Text tone="muted" variant="caption" style={{ marginBottom: theme.spacing.md }}>
          ⚠️ Requires a connected backend with the AI function deployed.
        </Text>
      )}

      {TASKS.map((t) => (
        <PressableCard key={t.task} style={styles.row} onPress={() => run(t.task)}>
          <Text style={styles.icon}>{t.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text weight="semibold">{t.title}</Text>
            <Text tone="muted" variant="caption">
              {t.subtitle}
            </Text>
          </View>
          {ai.isPending && active === t.task ? <ActivityIndicator color={theme.colors.accent} /> : <Text tone="faint">›</Text>}
        </PressableCard>
      ))}

      {result ? (
        <Card style={styles.result}>
          <Text variant="label" tone="muted">
            RESULT
          </Text>
          <Text style={{ marginTop: theme.spacing.sm, lineHeight: 22 }}>{result}</Text>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  consent: { marginBottom: theme.spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md },
  icon: { fontSize: 26 },
  result: { marginTop: theme.spacing.lg },
  lock: { alignItems: 'center', paddingVertical: theme.spacing.xxl, gap: theme.spacing.sm },
  lockIcon: { fontSize: 56 },
  center: { textAlign: 'center', maxWidth: 320 },
});
