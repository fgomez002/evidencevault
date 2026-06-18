import { Stack } from 'expo-router';
import { theme } from '@/theme';

const headerStyle = {
  headerStyle: { backgroundColor: theme.colors.bg },
  headerTintColor: theme.colors.text,
  headerTitleStyle: { color: theme.colors.text },
  contentStyle: { backgroundColor: theme.colors.bg },
  headerShadowVisible: false,
};

export default function AppLayout() {
  return (
    <Stack screenOptions={headerStyle}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="incident/new" options={{ title: 'New incident', presentation: 'modal' }} />
      <Stack.Screen name="incident/[id]" options={{ title: 'Incident' }} />
      <Stack.Screen name="incident/edit/[id]" options={{ title: 'Edit incident', presentation: 'modal' }} />
      <Stack.Screen name="evidence/add" options={{ title: 'Add evidence', presentation: 'modal' }} />
      <Stack.Screen name="evidence/[id]" options={{ title: 'Evidence' }} />
      <Stack.Screen name="settings/index" options={{ title: 'Settings' }} />

      <Stack.Screen name="witness/index" options={{ title: 'Witnesses' }} />
      <Stack.Screen name="witness/new" options={{ title: 'New witness', presentation: 'modal' }} />
      <Stack.Screen name="witness/[id]" options={{ title: 'Witness' }} />
      <Stack.Screen name="witness/edit/[id]" options={{ title: 'Edit witness', presentation: 'modal' }} />

      <Stack.Screen name="report/index" options={{ title: 'Police reports' }} />
      <Stack.Screen name="report/new" options={{ title: 'New report', presentation: 'modal' }} />
      <Stack.Screen name="report/[id]" options={{ title: 'Police report' }} />
      <Stack.Screen name="report/edit/[id]" options={{ title: 'Edit report', presentation: 'modal' }} />

      <Stack.Screen name="contact/index" options={{ title: 'Contacts' }} />
      <Stack.Screen name="contact/new" options={{ title: 'New contact', presentation: 'modal' }} />
      <Stack.Screen name="contact/[id]" options={{ title: 'Contact' }} />
      <Stack.Screen name="contact/edit/[id]" options={{ title: 'Edit contact', presentation: 'modal' }} />

      <Stack.Screen name="export/index" options={{ title: 'Reports & export' }} />
      <Stack.Screen name="checkin/index" options={{ title: 'Check-ins' }} />
      <Stack.Screen name="assistant/index" options={{ title: 'AI assistant' }} />
      <Stack.Screen name="search/index" options={{ title: 'Smart search' }} />
      <Stack.Screen name="paywall" options={{ title: 'EvidenceVault Premium', presentation: 'modal' }} />
      <Stack.Screen name="panic" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
    </Stack>
  );
}
