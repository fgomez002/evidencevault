import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import {
  configurePurchases,
  refreshPremium,
  onPremiumChange,
  isPurchasesAvailable,
  identifyPurchasesUser,
} from '@/lib/purchases';
import { supabase } from '@/lib/supabase';

const OVERRIDE_KEY = 'ev_premium_override';

interface SubscriptionState {
  /** Real entitlement from RevenueCat (App Store / Google Play). */
  storePremium: boolean;
  /** Whether real in-app purchases are available on this build. */
  purchasesAvailable: boolean;
  /** Local override for testing / demo before/without store billing. */
  override: boolean;
  init: () => Promise<void>;
  setOverride: (v: boolean) => Promise<void>;
  setStorePremium: (v: boolean) => void;
  refresh: () => Promise<void>;
}

let unsubscribe: (() => void) | null = null;

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  storePremium: false,
  purchasesAvailable: false,
  override: false,

  init: async () => {
    const v = await SecureStore.getItemAsync(OVERRIDE_KEY);
    set({ override: v === '1', purchasesAvailable: isPurchasesAvailable() });

    const ok = await configurePurchases();
    if (ok) {
      // Map RevenueCat to the signed-in user so entitlements follow the account.
      const { data } = await supabase.auth.getUser();
      if (data.user?.id) await identifyPurchasesUser(data.user.id);

      set({ storePremium: await refreshPremium() });
      unsubscribe?.();
      unsubscribe = onPremiumChange((premium) => set({ storePremium: premium }));
    }
  },

  setOverride: async (v: boolean) => {
    await SecureStore.setItemAsync(OVERRIDE_KEY, v ? '1' : '0');
    set({ override: v });
  },

  setStorePremium: (v: boolean) => set({ storePremium: v }),

  refresh: async () => {
    set({ storePremium: await refreshPremium() });
  },
}));
