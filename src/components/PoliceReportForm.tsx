import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Input, Button, Chip } from '@/components/ui';
import { REPORT_STATUSES, theme } from '@/theme';
import type { PoliceReportInput } from '@/hooks/usePoliceReports';
import type { PoliceReportStatus } from '@/lib/database.types';

interface Props {
  initial?: Partial<PoliceReportInput>;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (input: PoliceReportInput) => void;
}

export function PoliceReportForm({ initial, submitting, submitLabel = 'Save report', onSubmit }: Props) {
  const [reportNumber, setReportNumber] = useState(initial?.report_number ?? '');
  const [agency, setAgency] = useState(initial?.agency ?? '');
  const [officer, setOfficer] = useState(initial?.officer_name ?? '');
  const [badge, setBadge] = useState(initial?.officer_badge ?? '');
  const [filedAt, setFiledAt] = useState(initial?.filed_at ?? '');
  const [status, setStatus] = useState<PoliceReportStatus>((initial?.status as PoliceReportStatus) ?? 'filed');
  const [followUp, setFollowUp] = useState(initial?.follow_up_notes ?? '');

  function submit() {
    onSubmit({
      report_number: reportNumber.trim() || null,
      agency: agency.trim() || null,
      officer_name: officer.trim() || null,
      officer_badge: badge.trim() || null,
      filed_at: filedAt.trim() || null,
      status,
      follow_up_notes: followUp.trim() || null,
      incident_id: initial?.incident_id ?? null,
    });
  }

  return (
    <View style={styles.form}>
      <Input label="Report number" value={reportNumber} onChangeText={setReportNumber} placeholder="e.g. 2026-04821" />
      <Input label="Agency" value={agency} onChangeText={setAgency} placeholder="Police department / sheriff's office" />
      <Input label="Officer name" value={officer} onChangeText={setOfficer} placeholder="Optional" />
      <Input label="Officer badge #" value={badge} onChangeText={setBadge} placeholder="Optional" />
      <Input label="Date filed" value={filedAt} onChangeText={setFiledAt} placeholder="YYYY-MM-DD" />

      <View>
        <Text variant="label" tone="muted" style={styles.label}>
          Status
        </Text>
        <View style={styles.chips}>
          {REPORT_STATUSES.map((s) => (
            <Chip
              key={s.value}
              label={s.label}
              color={s.color}
              selected={status === s.value}
              onPress={() => setStatus(s.value)}
            />
          ))}
        </View>
      </View>

      <Input label="Follow-up notes" value={followUp} onChangeText={setFollowUp} multiline placeholder="Calls made, responses received, next steps…" />
      <Button title={submitLabel} onPress={submit} loading={submitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: theme.spacing.lg },
  label: { marginLeft: theme.spacing.xs, marginBottom: theme.spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
});
