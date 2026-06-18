import type { CheckIn } from '@/hooks/useCheckIns';

/**
 * A check-in is overdue when it's still pending and the confirm-by window
 * (scheduled_at + window_minutes) has elapsed. The user said they'd confirm
 * they were safe by then and hasn't — which is exactly the signal the
 * check-in system exists to surface.
 */
export function isOverdue(c: CheckIn, now: number = Date.now()): boolean {
  if (c.status !== 'pending') return false;
  const due = new Date(c.scheduled_at).getTime() + c.window_minutes * 60_000;
  return now > due;
}

export function missedCheckInMessage(scheduledAt: string): string {
  return (
    `EvidenceVault safety alert: I scheduled a check-in for ` +
    `${new Date(scheduledAt).toLocaleString()} and did not confirm I was safe. ` +
    `Please try to reach me.`
  );
}
