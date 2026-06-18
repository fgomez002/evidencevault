import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

/** Schedule a local reminder for a check-in at the given time. Returns the id. */
export async function scheduleCheckInReminder(at: Date, label: string): Promise<string | null> {
  const ok = await ensureNotificationPermission();
  if (!ok) return null;
  if (at.getTime() <= Date.now()) return null;
  return Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Safety check-in',
      body: label || 'Tap to confirm you are safe.',
      data: { type: 'check_in' },
    },
    // Expo SDK 51 accepts a Date as a one-shot scheduled trigger.
    trigger: at,
  });
}

export async function cancelReminder(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // already fired / unknown id
  }
}
