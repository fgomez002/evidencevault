import { View, StyleSheet, Alert, Pressable, Linking } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Screen, Text, Button, Chip, DetailField } from '@/components/ui';
import { useContact, useDeleteContact } from '@/hooks/useContacts';
import { relationshipMeta, theme } from '@/theme';

export default function ContactDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: contact, isLoading } = useContact(id);
  const del = useDeleteContact();

  if (isLoading || !contact) {
    return (
      <Screen>
        <Text tone="muted">Loading…</Text>
      </Screen>
    );
  }

  const r = relationshipMeta(contact.relationship);

  function confirmDelete() {
    Alert.alert('Delete contact?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => del.mutate(id!, { onSuccess: () => router.back() }) },
    ]);
  }

  return (
    <Screen scroll>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => router.push(`/(app)/contact/edit/${id}`)} hitSlop={10}>
              <Text tone="accent" weight="semibold">
                Edit
              </Text>
            </Pressable>
          ),
        }}
      />

      <View style={styles.hero}>
        <View style={[styles.avatar, { backgroundColor: r.color + '33' }]}>
          <Text variant="title">{contact.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text variant="title">{contact.name}</Text>
        <Chip label={r.label} icon={r.icon} color={r.color} selected />
        {contact.is_panic_recipient ? (
          <Text tone="danger" variant="caption">
            🚨 Panic recipient
          </Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        {contact.phone ? (
          <Button title="Call" icon="📞" variant="secondary" fullWidth={false} onPress={() => Linking.openURL(`tel:${contact.phone}`)} />
        ) : null}
        {contact.phone ? (
          <Button title="Text" icon="💬" variant="secondary" fullWidth={false} onPress={() => Linking.openURL(`sms:${contact.phone}`)} />
        ) : null}
        {contact.email ? (
          <Button title="Email" icon="✉️" variant="secondary" fullWidth={false} onPress={() => Linking.openURL(`mailto:${contact.email}`)} />
        ) : null}
      </View>

      <DetailField label="Phone" value={contact.phone} />
      <DetailField label="Email" value={contact.email} />
      <DetailField label="Notes" value={contact.notes} multiline />

      <View style={styles.delete}>
        <Button title="Delete contact" variant="ghost" onPress={confirmDelete} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: theme.spacing.sm, marginVertical: theme.spacing.lg },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.lg, flexWrap: 'wrap' },
  delete: { marginTop: theme.spacing.xl },
});
