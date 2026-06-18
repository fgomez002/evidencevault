import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Input, Button } from '@/components/ui';
import { theme } from '@/theme';
import type { WitnessInput } from '@/hooks/useWitnesses';

interface Props {
  initial?: Partial<WitnessInput>;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (input: WitnessInput) => void;
}

export function WitnessForm({ initial, submitting, submitLabel = 'Save witness', onSubmit }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [eventDate, setEventDate] = useState(initial?.event_date ?? '');
  const [statement, setStatement] = useState(initial?.written_statement ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (!name.trim()) {
      setError('Please enter the witness name.');
      return;
    }
    setError(null);
    onSubmit({
      name: name.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
      event_date: eventDate.trim() || null,
      written_statement: statement.trim() || null,
      notes: notes.trim() || null,
    });
  }

  return (
    <View style={styles.form}>
      <Input label="Name" value={name} onChangeText={setName} placeholder="Full name" />
      <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Optional" />
      <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Optional" />
      <Input label="Date of event" value={eventDate} onChangeText={setEventDate} placeholder="YYYY-MM-DD" hint="When they witnessed the event" />
      <Input label="Written statement" value={statement} onChangeText={setStatement} multiline placeholder="What did this person witness? Record it in their words." />
      <Input label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Anything else relevant (optional)" />
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
});
