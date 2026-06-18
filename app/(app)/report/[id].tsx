import { View, StyleSheet, Alert, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Screen, Text, Button, Chip, DetailField } from '@/components/ui';
import { usePoliceReport, useDeletePoliceReport } from '@/hooks/usePoliceReports';
import { reportStatusMeta, theme } from '@/theme';

export default function ReportDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: report, isLoading } = usePoliceReport(id);
  const del = useDeletePoliceReport();

  if (isLoading || !report) {
    return (
      <Screen>
        <Text tone="muted">Loading…</Text>
      </Screen>
    );
  }

  const s = reportStatusMeta(report.status);

  function confirmDelete() {
    Alert.alert('Delete report?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => del.mutate(id!, { onSuccess: () => router.back() }) },
    ]);
  }

  return (
    <Screen scroll>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => router.push(`/(app)/report/edit/${id}`)} hitSlop={10}>
              <Text tone="accent" weight="semibold">
                Edit
              </Text>
            </Pressable>
          ),
        }}
      />

      <View style={styles.hero}>
        <Text variant="title">{report.report_number ? `#${report.report_number}` : 'Police report'}</Text>
        <View style={styles.statusRow}>
          <Chip label={s.label} color={s.color} selected />
        </View>
      </View>

      <DetailField label="Agency" value={report.agency} />
      <DetailField label="Officer" value={report.officer_name} />
      <DetailField label="Badge #" value={report.officer_badge} />
      <DetailField label="Date filed" value={report.filed_at} />
      <DetailField label="Follow-up notes" value={report.follow_up_notes} multiline />

      <View style={styles.delete}>
        <Button title="Delete report" variant="ghost" onPress={confirmDelete} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: theme.spacing.md, marginVertical: theme.spacing.lg },
  statusRow: { flexDirection: 'row' },
  delete: { marginTop: theme.spacing.xl },
});
