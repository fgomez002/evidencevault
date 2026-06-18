import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Screen, Text, Card, Button, Input } from '@/components/ui';
import { useCheckIns, useCreateCheckIn, useUpdateCheckInStatus, useDeleteCheckIn, CheckIn } from '@/hooks/useCheckIns';
import { scheduleCheckInReminder } from '@/lib/notifications';
import { theme } from '@/theme';

const QUICK = [
  { label: '+1 hour', mins: 60 },
  { label: '+3 hours', mins: 180 },
  { label: 'Tonight (8pm)', mins: -1 },
];

export default function CheckIns() {
  const { data: checkIns = [] } = useCheckIns();
  const create = useCreateCheckIn();
  const updateStatus = useUpdateCheckInStatus();
  const del = useDeleteCheckIn();
  const [windowMin, setWindowMin] = useState('30');

  async function schedule(mins: number) {
    const at = new Date();
    if (mins === -1) {
      at.setHours(20, 0, 0, 0);
      if (at.getTime() < Date.now()) at.setDate(at.getDate() + 1);
    } else {
      at.setMinutes(at.getMinutes() + mins);
    }
    create.mutate(
      { scheduled_at: at.toISOString(), window_minutes: parseInt(windowMin, 10) || 30 },
      {
        onSuccess: async () => {
          await scheduleCheckInReminder(at, 'Confirm you are safe in EvidenceVault.');
        },
        onError: (e) => Alert.alert('Could not schedule', (e as Error).message),
      },
    );
  }

  const now = Date.now();
  const upcoming = checkIns.filter((c) => c.status === 'pending');
  const past = checkIns.filter((c) => c.status !== 'pending');

  function statusOf(c: CheckIn): { text: string; tone: 'muted' | 'accent' | 'danger' } {
    if (c.status === 'confirmed') return { text: 'Confirmed ✓', tone: 'accent' };
    if (c.status === 'missed') return { text: 'Missed', tone: 'danger' };
    const due = new Date(c.scheduled_at).getTime() + c.window_minutes * 60_000;
    if (now > due) return { text: 'Overdue — confirm now', tone: 'danger' };
    return { text: 'Scheduled', tone: 'muted' };
  }

  return (
    <Screen scroll>
      <Text tone="muted" variant="caption" style={styles.intro}>
        Schedule a check-in. If you don't confirm within your window, EvidenceVault flags it as
        missed so you (or, with the panic button, your contacts) can act.
      </Text>

      <Card style={styles.scheduler}>
        <Text variant="label">Schedule a check-in</Text>
        <Input
          label="Confirm-by window (minutes)"
          value={windowMin}
          onChangeText={setWindowMin}
          keyboardType="number-pad"
        />
        <View style={styles.quick}>
          {QUICK.map((q) => (
            <Button key={q.label} title={q.label} variant="secondary" fullWidth={false} onPress={() => schedule(q.mins)} />
          ))}
        </View>
      </Card>

      {upcoming.length > 0 && (
        <>
          <Text variant="heading" style={styles.section}>
            Upcoming
          </Text>
          {upcoming.map((c) => {
            const s = statusOf(c);
            return (
              <Card key={c.id} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text weight="semibold">{new Date(c.scheduled_at).toLocaleString()}</Text>
                  <Text tone={s.tone} variant="caption">
                    {s.text} · window {c.window_minutes}m
                  </Text>
                </View>
                <Button title="I'm safe" fullWidth={false} onPress={() => updateStatus.mutate({ id: c.id, status: 'confirmed' })} />
              </Card>
            );
          })}
        </>
      )}

      {past.length > 0 && (
        <>
          <Text variant="heading" style={styles.section}>
            History
          </Text>
          {past.map((c) => {
            const s = statusOf(c);
            return (
              <Card key={c.id} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text weight="semibold">{new Date(c.scheduled_at).toLocaleString()}</Text>
                  <Text tone={s.tone} variant="caption">
                    {s.text}
                  </Text>
                </View>
                <Button title="Delete" variant="ghost" fullWidth={false} onPress={() => del.mutate(c.id)} />
              </Card>
            );
          })}
        </>
      )}

      {checkIns.length === 0 && (
        <Text tone="faint" style={{ textAlign: 'center', marginTop: theme.spacing.xl }}>
          No check-ins scheduled yet.
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { marginBottom: theme.spacing.lg, lineHeight: 18 },
  scheduler: { gap: theme.spacing.md },
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  section: { marginTop: theme.spacing.xl, marginBottom: theme.spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md },
});
