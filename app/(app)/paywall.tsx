import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Card, Button } from '@/components/ui';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useSubscription } from '@/hooks/useSubscription';
import {
  getCurrentOffering,
  purchasePackage,
  restorePurchases,
  type PurchasesOffering,
  type PurchasesPackage,
} from '@/lib/purchases';
import { theme } from '@/theme';

const FREE = ['1 GB storage', 'Incident journal', 'Evidence vault', 'Basic reports'];
const PREMIUM = [
  'Unlimited storage',
  'AI summaries & pattern detection',
  'Attorney-ready PDF case files',
  'Cloud backup',
  'Advanced smart search',
  'Full integrity reports',
];

export default function Paywall() {
  const router = useRouter();
  const { isPremium } = useSubscription();
  const purchasesAvailable = useSubscriptionStore((s) => s.purchasesAvailable);
  const setStorePremium = useSubscriptionStore((s) => s.setStorePremium);
  const setOverride = useSubscriptionStore((s) => s.setOverride);

  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(purchasesAvailable);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!purchasesAvailable) return;
    getCurrentOffering()
      .then(setOffering)
      .finally(() => setLoading(false));
  }, [purchasesAvailable]);

  async function buy(pkg: PurchasesPackage) {
    try {
      setBusy(true);
      const premium = await purchasePackage(pkg);
      setStorePremium(premium);
      if (premium) {
        Alert.alert('Welcome to Premium', 'Your subscription is active.');
        router.back();
      }
    } catch (e: any) {
      if (!e?.userCancelled) Alert.alert('Purchase failed', e?.message ?? 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function restore() {
    try {
      setBusy(true);
      const premium = await restorePurchases();
      setStorePremium(premium);
      Alert.alert(premium ? 'Restored' : 'Nothing to restore', premium ? 'Premium is active.' : 'No previous purchase found.');
      if (premium) router.back();
    } catch (e: any) {
      Alert.alert('Restore failed', e?.message ?? 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function enableDemo() {
    Alert.alert(
      'Enable Premium (demo)',
      'This build has no store billing configured. Enable Premium locally to try the gated features?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Enable', onPress: async () => { await setOverride(true); router.back(); } },
      ],
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.icon}>⭐</Text>
        <Text variant="title">EvidenceVault Premium</Text>
        <Text tone="muted" style={styles.tagline}>
          Everything you need to build a credible, court-ready record.
        </Text>
      </View>

      <View style={styles.plans}>
        <Card style={styles.plan}>
          <Text variant="heading">Free</Text>
          <Text tone="muted" variant="caption" style={styles.price}>$0</Text>
          {FREE.map((f) => (
            <Text key={f} style={styles.feature}>✓ {f}</Text>
          ))}
        </Card>

        <Card style={[styles.plan, styles.planPremium]} elevated>
          <Text variant="heading" tone="accent">Premium</Text>
          {PREMIUM.map((f) => (
            <Text key={f} style={styles.feature}>✓ {f}</Text>
          ))}
        </Card>
      </View>

      {isPremium ? (
        <Card style={styles.active}>
          <Text weight="semibold" tone="accent">✓ Premium is active</Text>
        </Card>
      ) : loading ? (
        <ActivityIndicator color={theme.colors.accent} style={{ marginTop: theme.spacing.xl }} />
      ) : offering && offering.availablePackages.length > 0 ? (
        <View style={styles.cta}>
          {offering.availablePackages.map((pkg) => (
            <Button
              key={pkg.identifier}
              title={`${pkg.product.title} — ${pkg.product.priceString}`}
              icon="⭐"
              loading={busy}
              onPress={() => buy(pkg)}
            />
          ))}
          <Pressable onPress={restore} disabled={busy} style={styles.restore}>
            <Text tone="accent" weight="semibold">Restore purchases</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.cta}>
          <Button title="Upgrade to Premium" icon="⭐" onPress={enableDemo} />
          <Text tone="faint" variant="caption" style={styles.demoNote}>
            {purchasesAvailable
              ? 'No subscription products are available yet. Configure offerings in RevenueCat.'
              : 'Store billing runs in a development/production build. This is the demo fallback.'}
          </Text>
        </View>
      )}

      <Text tone="faint" variant="caption" style={styles.legal}>
        Subscriptions are billed through the App Store or Google Play and renew automatically until
        cancelled. Manage or cancel anytime in your store account settings.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  hero: { alignItems: 'center', gap: theme.spacing.xs, marginVertical: theme.spacing.lg },
  icon: { fontSize: 56 },
  tagline: { textAlign: 'center', maxWidth: 300 },
  plans: { gap: theme.spacing.md, marginTop: theme.spacing.md },
  plan: { gap: theme.spacing.xs },
  planPremium: { borderColor: theme.colors.accent },
  price: { marginBottom: theme.spacing.sm },
  feature: { lineHeight: 24 },
  cta: { marginTop: theme.spacing.xl, gap: theme.spacing.md },
  restore: { alignItems: 'center', paddingVertical: theme.spacing.sm },
  demoNote: { textAlign: 'center' },
  active: { marginTop: theme.spacing.xl, alignItems: 'center' },
  legal: { textAlign: 'center', marginTop: theme.spacing.xl, lineHeight: 16 },
});
