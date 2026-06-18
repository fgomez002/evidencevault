import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import type { Profile } from '@/lib/database.types';

/**
 * Resolves the user's plan. Real tier comes from `profiles.subscription_tier`
 * (set by the RevenueCat webhook in production). A local override allows testing
 * premium-gated features in demo mode before billing is wired up.
 */
export function useSubscription() {
  const override = useSubscriptionStore((s) => s.override);
  const storePremium = useSubscriptionStore((s) => s.storePremium);

  const query = useQuery<Profile | null>({
    queryKey: ['profile'],
    enabled: isSupabaseConfigured,
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return null;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
      if (error) throw error;
      return data as Profile;
    },
  });

  const tier = query.data?.subscription_tier ?? 'free';
  const isPremium = override || storePremium || tier === 'premium';
  return { isPremium, tier, profile: query.data ?? null };
}
