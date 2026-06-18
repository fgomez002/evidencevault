import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FormScroll } from '@/components/ui';
import { WitnessForm } from '@/components/WitnessForm';
import { useWitness, useUpdateWitness } from '@/hooks/useWitnesses';
import { theme } from '@/theme';

export default function EditWitness() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: witness } = useWitness(id);
  const update = useUpdateWitness();

  if (!witness) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <FormScroll>
      <WitnessForm
        initial={witness}
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
