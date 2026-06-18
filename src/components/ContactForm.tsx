import { useState } from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { Text, Input, Button, Chip, Card } from '@/components/ui';
import { CONTACT_RELATIONSHIPS, theme } from '@/theme';
import type { ContactInput } from '@/hooks/useContacts';
import type { ContactRelationship } from '@/lib/database.types';

interface Props {
  initial?: Partial<ContactInput>;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (input: ContactInput) => void;
}

export function ContactForm({ initial, submitting, submitLabel = 'Save contact', onSubmit }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [relationship, setRelationship] = useState<ContactRelationship>(
    (initial?.relationship as ContactRelationship) ?? 'family',
  );
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [isPanic, setIsPanic] = useState(initial?.is_panic_recipient ?? false);
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (!name.trim()) {
      setError('Please enter a name.');
      return;
    }
    setError(null);
    onSubmit({
      name: name.trim(),
      relationship,
      phone: phone.trim() || null,
      email: email.trim() || null,
      is_panic_recipient: isPanic,
      notes: notes.trim() || null,
    });
  }

  return (
    <View style={styles.form}>
      <Input label="Name" value={name} onChangeText={setName} placeholder="Full name" />

      <View>
        <Text variant="label" tone="muted" style={styles.label}>
          Relationship
        </Text>
        <View style={styles.chips}>
          {CONTACT_RELATIONSHIPS.map((r) => (
            <Chip
              key={r.value}
              label={r.label}
              icon={r.icon}
              color={r.color}
              selected={relationship === r.value}
              onPress={() => setRelationship(r.value)}
            />
          ))}
        </View>
      </View>

      <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Optional" />
      <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Optional" />

      <Card>
        <View style={styles.panicRow}>
          <View style={{ flex: 1 }}>
            <Text weight="semibold">🚨 Panic recipient</Text>
            <Text tone="muted" variant="caption">
              Include this person when the panic button is triggered.
            </Text>
          </View>
          <Switch
            value={isPanic}
            onValueChange={setIsPanic}
            trackColor={{ true: theme.colors.dangerDim, false: theme.colors.border }}
            thumbColor={isPanic ? theme.colors.danger : theme.colors.textFaint}
          />
        </View>
      </Card>

      <Input label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Optional" />
      {error ? (
        <Text tone="danger" variant="caption">
          {error}
        </Text>
      ) : null}
      <Button title={submitLabel} onPress={submit} loading={submitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: theme.spacing.lg },
  label: { marginLeft: theme.spacing.xs, marginBottom: theme.spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  panicRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
});
