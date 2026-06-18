import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Animated, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui';
import { useContacts } from '@/hooks/useContacts';
import { triggerPanic } from '@/lib/panic';
import { theme } from '@/theme';

const HOLD_MS = 1800;

export default function Panic() {
  const router = useRouter();
  const { data: contacts = [] } = useContacts();
  const progress = useRef(new Animated.Value(0)).current;
  const [firing, setFiring] = useState(false);
  const recipients = contacts.filter((c) => c.is_panic_recipient && c.phone);

  function startHold() {
    Animated.timing(progress, { toValue: 1, duration: HOLD_MS, useNativeDriver: false }).start(({ finished }) => {
      if (finished) fire();
    });
  }
  function cancelHold() {
    Animated.timing(progress, { toValue: 0, duration: 150, useNativeDriver: false }).start();
  }

  async function fire() {
    if (firing) return;
    setFiring(true);
    try {
      const res = await triggerPanic(contacts);
      if (res.recipients.length === 0) {
        Alert.alert(
          'No panic recipients',
          'Add a contact and mark them as a panic recipient so EvidenceVault can alert them.',
        );
      }
    } catch (e) {
      Alert.alert('Panic error', (e as Error).message);
    } finally {
      setFiring(false);
      progress.setValue(0);
    }
  }

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text tone="muted">✕ Close</Text>
        </Pressable>
      </View>

      <View style={styles.center}>
        <Text style={styles.icon}>🚨</Text>
        <Text variant="title" style={styles.title}>
          Emergency alert
        </Text>
        <Text tone="muted" style={styles.desc}>
          Hold the button to send your location and an emergency message to{' '}
          {recipients.length > 0 ? `${recipients.length} trusted contact${recipients.length > 1 ? 's' : ''}` : 'your panic contacts'}.
        </Text>

        <Pressable
          onPressIn={startHold}
          onPressOut={cancelHold}
          style={styles.button}
          disabled={firing}
        >
          <Animated.View style={[styles.fill, { width }]} />
          <Text weight="bold" style={styles.buttonText}>
            {firing ? 'SENDING…' : 'HOLD TO ALERT'}
          </Text>
        </Pressable>

        <Text tone="faint" variant="caption" style={styles.note}>
          This opens your messaging app with the alert pre-filled. EvidenceVault is not a
          substitute for calling your local emergency number.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1A0B0D' },
  header: { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md, alignItems: 'flex-start' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl, gap: theme.spacing.md },
  icon: { fontSize: 72 },
  title: { color: theme.colors.text },
  desc: { textAlign: 'center', maxWidth: 320 },
  button: {
    marginTop: theme.spacing.xl,
    height: 72,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.dangerDim,
    borderWidth: 2,
    borderColor: theme.colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: theme.colors.danger },
  buttonText: { color: '#fff', fontSize: 18, letterSpacing: 1 },
  note: { textAlign: 'center', maxWidth: 300, marginTop: theme.spacing.lg },
});
