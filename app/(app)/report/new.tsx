import { useRouter } from 'expo-router';
import { FormScroll } from '@/components/ui';
import { PoliceReportForm } from '@/components/PoliceReportForm';
import { useCreatePoliceReport } from '@/hooks/usePoliceReports';

export default function NewReport() {
  const router = useRouter();
  const create = useCreatePoliceReport();
  return (
    <FormScroll>
      <PoliceReportForm
        submitting={create.isPending}
        onSubmit={(input) =>
          create.mutate(input, { onSuccess: (r) => router.replace(`/(app)/report/${r.id}`) })
        }
      />
    </FormScroll>
  );
}
