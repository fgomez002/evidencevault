import { useRouter } from 'expo-router';
import { FormScroll } from '@/components/ui';
import { WitnessForm } from '@/components/WitnessForm';
import { useCreateWitness } from '@/hooks/useWitnesses';

export default function NewWitness() {
  const router = useRouter();
  const create = useCreateWitness();
  return (
    <FormScroll>
      <WitnessForm
        submitting={create.isPending}
        onSubmit={(input) =>
          create.mutate(input, { onSuccess: (w) => router.replace(`/(app)/witness/${w.id}`) })
        }
      />
    </FormScroll>
  );
}
