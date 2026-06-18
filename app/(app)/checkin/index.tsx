import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Screen, Text, Card, Button, Input } from '@/components/ui';
import { useCheckIns, useCreateCheckIn, useUpdateCheckInStatus, useDeleteCheckIn, CheckIn } from '@/hooks/useCheckIns';
import { useContacts } from '@/hooks/useContacts';
import { scheduleCheckInReminder } from '@/lib/notifications';
import { isOverdue, missedCheckInMessage } from '@/lib/checkin';
import { triggerPanic } from '@/lib/panic';
import { theme } from '@/theme';

const QUICK = [
  { label: '+1 hour', mins: 60 },
  { label: '+3 hours', mins: 180 },
  { label: 'Tonight (8pm)', mins: -1 },
];

export default function CheckIns() {
  const { data: checkIns = [] } = useCheckIns();
  const { data: contacts = [] } = useContacts();
  const create = useCreateCheckIn();
  const updateStatus = useUpdateCheckInStatus();
  const del = useDeleteCheckIn();
  const [windowMin, setWindowMin] = useState('30');
  const handledOverdue = useRef<Set<string>>(new Set());

  // When a pending check-in passes its confirm window, flag it as missed and
  // offer to alert the user's panic contacts. We only prompt once per check-in.
  useEffect(() => {
    const overdue = checkIns.filter((c) => isOverdue(c) && !handledOverdue.current.has(c.id));
    if (overdue.length === 0) return;

    for (const c of overdue) {
      handledOverdue.current.add(c.id);
      updateStatus.mutate({ id: c.id, status: 'missed' });
    }

    const latest = overdue.sort(
      (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime(),
    )[0];
    const recipients = contacts.filter((p) => p.is_panic_recipient && p.phone);

    Alert.alert(
      '⚠️ Missed check-in',
      recipients.length > 0
        ? `You didn't confirm a check-in scheduled for ${new Date(latest.scheduled_at).toLocaleString()}. Alert your ${recipients.length} panic contact${recipients.length > 1 ? 's' : ''}?`
        : `You didn't confirm a check-in scheduled for ${new Date(latest.scheduled_at).toLocaleString()}. Add a panic contact to enable automatic alerts.`,
      recipients.length > 0
        ? [
            { text: 'Not now', style: 'cancel' },
            {
              text: 'Alert contacts',
              style: 'destructive',
              onPress: () => triggerPanic(contacts, missedCheckInMessage(latest.scheduled_at)),
            },
          ]
        : [{ text: 'OK' }],
    );
  }, [checkIns, contacts, updateStatus]);

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
