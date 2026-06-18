import { ScrollView, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IncidentForm } from '@/components/IncidentForm';
import { useIncident, useUpdateIncident } from '@/hooks/useIncidents';
import { theme } from '@/theme';

export default function EditIncident() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: incident, isLoading } = useIncident(id);
  const update = useUpdateIncident();

  if (isLoading || !incident) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <IncidentForm
        initial={incident}
        submitLabel="Save changes"
        submitting={update.isPending}
        onSubmit={(input) =>
          update.mutate({ id: id!, input }, { onSuccess: () => router.back() })
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bg },
});
