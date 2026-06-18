import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FormScroll } from '@/components/ui';
import { ContactForm } from '@/components/ContactForm';
import { useContact, useUpdateContact } from '@/hooks/useContacts';
import { theme } from '@/theme';

export default function EditContact() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: contact } = useContact(id);
  const update = useUpdateContact();

  if (!contact) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <FormScroll>
      <ContactForm
        initial={contact}
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
