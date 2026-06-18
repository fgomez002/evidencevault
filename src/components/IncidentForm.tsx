import { useState } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Text, Input, Button, Card, Chip } from '@/components/ui';
import { INCIDENT_CATEGORIES, theme } from '@/theme';
import { captureLocation, CapturedLocation } from '@/lib/location';
import type { IncidentInput } from '@/hooks/useIncidents';
import type { IncidentCategory } from '@/lib/database.types';

interface Props {
  initial?: Partial<IncidentInput>;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (input: IncidentInput) => void;
}

export function IncidentForm({ initial, submitting, submitLabel = 'Save incident', onSubmit }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [category, setCategory] = useState<IncidentCategory>(
    (initial?.category as IncidentCategory) ?? 'harassment',
  );
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [impact, setImpact] = useState(initial?.emotional_impact ?? '');
  const [followUp, setFollowUp] = useState(initial?.follow_up_actions ?? '');
  const [location, setLocation] = useState<CapturedLocation | null>(
    initial?.latitude != null && initial?.longitude != null
      ? { latitude: initial.latitude, longitude: initial.longitude, label: initial.location_label ?? undefined }
      : null,
  );
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCaptureLocation() {
    setLocating(true);
    const loc = await captureLocation();
    setLocating(false);
    if (!loc) {
      setError('Location permission was denied.');
      return;
    }
    setLocation(loc);
  }

  function submit() {
    if (!title.trim()) {
      setError('Please add a short title.');
      return;
    }
    setError(null);
    onSubmit({
      title: title.trim(),
      category,
      notes: notes.trim() || null,
      emotional_impact: impact.trim() || null,
      follow_up_actions: followUp.trim() || null,
      occurred_at: initial?.occurred_at ?? new Date().toISOString(),
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
      location_label: location?.label ?? null,
    });
  }

  return (
    <View style={styles.form}>
      <Input label="Title" value={title} onChangeText={setTitle} placeholder="Brief summary of what happened" />

      <View>
        <Text variant="label" tone="muted" style={styles.label}>
          Category
        </Text>
        <View style={styles.chips}>
          {INCIDENT_CATEGORIES.map((c) => (
            <Chip
              key={c.value}
              label={c.label}
              icon={c.icon}
              color={c.color}
              selected={category === c.value}
              onPress={() => setCategory(c.value)}
            />
          ))}
        </View>
      </View>

      <Input label="What happened" value={notes} onChangeText={setNotes} multiline placeholder="Describe the incident in detail. Include people, vehicles, times, and anything said." />
      <Input label="Emotional impact" value={impact} onChangeText={setImpact} multiline placeholder="How did this affect you? (optional)" />
      <Input label="Follow-up actions taken" value={followUp} onChangeText={setFollowUp} multiline placeholder="Reported to police, told a friend, etc. (optional)" />

      <Card>
        <View style={styles.locRow}>
          <View style={{ flex: 1 }}>
            <Text weight="semibold">📍 Location</Text>
            {location ? (
              <Text tone="muted" variant="caption">
                {location.label ?? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`}
              </Text>
            ) : (
              <Text tone="faint" variant="caption">
                Not captured
              </Text>
            )}
          </View>
          <Pressable onPress={onCaptureLocation} style={styles.locBtn} disabled={locating}>
            {locating ? (
              <ActivityIndicator color={theme.colors.accent} />
            ) : (
              <Text tone="accent" weight="semibold">
                {location ? 'Update' : 'Capture GPS'}
              </Text>
            )}
          </Pressable>
        </View>
      </Card>

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
  locRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  locBtn: { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md },
});
