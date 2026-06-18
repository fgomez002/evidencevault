import { useRouter } from 'expo-router';
import { FormScroll } from '@/components/ui';
import { ContactForm } from '@/components/ContactForm';
import { useCreateContact } from '@/hooks/useContacts';

export default function NewContact() {
  const router = useRouter();
  const create = useCreateContact();
  return (
    <FormScroll>
      <ContactForm
        submitting={create.isPending}
        onSubmit={(input) =>
          create.mutate(input, { onSuccess: (c) => router.replace(`/(app)/contact/${c.id}`) })
        }
      />
    </FormScroll>
  );
}
