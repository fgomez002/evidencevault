import { View, StyleSheet, Alert, Pressable, Linking } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Screen, Text, Button, DetailField } from '@/components/ui';
import { useWitness, useDeleteWitness } from '@/hooks/useWitnesses';
import { theme } from '@/theme';

export default function WitnessDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: witness, isLoading } = useWitness(id);
  const del = useDeleteWitness();

  if (isLoading || !witness) {
    return (
      <Screen>
        <Text tone="muted">Loading…</Text>
      </Screen>
    );
  }

  function confirmDelete() {
    Alert.alert('Delete witness?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => del.mutate(id!, { onSuccess: () => router.back() }) },
    ]);
  }

  return (
    <Screen scroll>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => router.push(`/(app)/witness/edit/${id}`)} hitSlop={10}>
              <Text tone="accent" weight="semibold">
                Edit
              </Text>
            </Pressable>
          ),
        }}
      />
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text variant="title">{witness.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text variant="title">{witness.name}</Text>
      </View>

      <DetailField label="Phone" value={witness.phone} onPress={witness.phone ? () => Linking.openURL(`tel:${witness.phone}`) : undefined} />
      <DetailField label="Email" value={witness.email} onPress={witness.email ? () => Linking.openURL(`mailto:${witness.email}`) : undefined} />
      <DetailField label="Date of event" value={witness.event_date} />
      <DetailField label="Written statement" value={witness.written_statement} multiline />
      <DetailField label="Notes" value={witness.notes} multiline />

      <View style={styles.delete}>
        <Button title="Delete witness" variant="ghost" onPress={confirmDelete} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: theme.spacing.md, marginVertical: theme.spacing.lg },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.surfacePressed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  delete: { marginTop: theme.spacing.xl },
});
