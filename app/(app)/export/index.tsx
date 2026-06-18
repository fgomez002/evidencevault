import { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Screen, Text, PressableCard } from '@/components/ui';
import { useIncidents } from '@/hooks/useIncidents';
import { useEvidenceList } from '@/hooks/useEvidence';
import { useWitnesses } from '@/hooks/useWitnesses';
import { usePoliceReports } from '@/hooks/usePoliceReports';
import { useIntegrityLog } from '@/hooks/useIntegrityLog';
import { exportPdf } from '@/lib/pdf';
import {
  caseFileHtml,
  integrityReportHtml,
  timelineReportHtml,
  evidenceIndexHtml,
  witnessListHtml,
  policeReportHistoryHtml,
} from '@/lib/reports';
import { useSubscription } from '@/hooks/useSubscription';
import { theme } from '@/theme';

export default function ExportHub() {
  const { data: incidents = [] } = useIncidents();
  const { data: evidence = [] } = useEvidenceList();
  const { data: witnesses = [] } = useWitnesses();
  const { data: reports = [] } = usePoliceReports();
  const { data: logs = [] } = useIntegrityLog();
  const { isPremium } = useSubscription();
  const [busy, setBusy] = useState<string | null>(null);

  async function run(key: string, html: string) {
    try {
      setBusy(key);
      await exportPdf(html);
    } catch (e) {
      Alert.alert('Export failed', (e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const options: { key: string; icon: string; title: string; subtitle: string; premium?: boolean; build: () => string }[] = [
    {
      key: 'case',
      icon: '📁',
      title: 'Full case file',
      subtitle: 'Everything: incidents, evidence, witnesses, reports',
      premium: true,
      build: () => caseFileHtml({ incidents, evidence, witnesses, reports, logs }),
    },
    {
      key: 'integrity',
      icon: '🔐',
      title: 'Integrity report',
      subtitle: 'SHA-256 hashes + chain-of-custody log',
      build: () => integrityReportHtml(evidence, logs),
    },
    {
      key: 'timeline',
      icon: '📈',
      title: 'Timeline report',
      subtitle: 'Events and evidence in chronological order',
      build: () => timelineReportHtml(incidents, evidence),
    },
    {
      key: 'evidence',
      icon: '🗂️',
      title: 'Evidence index',
      subtitle: 'Numbered list of all evidence on file',
      build: () => evidenceIndexHtml(evidence),
    },
    {
      key: 'witnesses',
      icon: '🧑‍🤝‍🧑',
      title: 'Witness list',
      subtitle: 'Names, contact info, and statements',
      build: () => witnessListHtml(witnesses),
    },
    {
      key: 'reports',
      icon: '🚔',
      title: 'Police report history',
      subtitle: 'Every report filed and its status',
      build: () => policeReportHistoryHtml(reports),
    },
  ];

  return (
    <Screen scroll>
      <Text tone="muted" variant="caption" style={styles.intro}>
        Generate a PDF you can save, print, or send to an attorney or investigator. Exports are
        recorded in your integrity log.
      </Text>

      {options.map((o) => {
        const locked = o.premium && !isPremium;
        return (
          <PressableCard
            key={o.key}
            style={styles.row}
            onPress={() => (locked ? Alert.alert('Premium feature', 'The full case file export is part of Premium.') : run(o.key, o.build()))}
          >
            <Text style={styles.icon}>{o.icon}</Text>
            <View style={styles.rowText}>
              <Text weight="semibold">
                {o.title} {locked ? '🔒' : ''}
              </Text>
              <Text tone="muted" variant="caption">
                {o.subtitle}
              </Text>
            </View>
            {busy === o.key ? <ActivityIndicator color={theme.colors.accent} /> : <Text tone="faint">›</Text>}
          </PressableCard>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { marginBottom: theme.spacing.lg, lineHeight: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md },
  icon: { fontSize: 26 },
  rowText: { flex: 1, gap: 2 },
});
