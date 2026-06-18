import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FormScroll } from '@/components/ui';
import { PoliceReportForm } from '@/components/PoliceReportForm';
import { usePoliceReport, useUpdatePoliceReport } from '@/hooks/usePoliceReports';
import { theme } from '@/theme';

export default function EditReport() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: report } = usePoliceReport(id);
  const update = useUpdatePoliceReport();

  if (!report) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <FormScroll>
      <PoliceReportForm
        initial={report}
        submitLabel="Save changes"
        submitting={update.isPending}
        onSubmit={(input) => update.mutate({ id: id!, input }, { onSuccess: () => router.back() })}
      />
    </FormScroll>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bg },
});
