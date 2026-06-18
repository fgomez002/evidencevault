import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { IncidentForm } from '@/components/IncidentForm';
import { useCreateIncident } from '@/hooks/useIncidents';
import { theme } from '@/theme';

export default function NewIncident() {
  const router = useRouter();
  const create = useCreateIncident();

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <IncidentForm
        submitting={create.isPending}
        onSubmit={(input) =>
          create.mutate(input, {
            onSuccess: (created) => router.replace(`/(app)/incident/${created.id}`),
          })
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
});
