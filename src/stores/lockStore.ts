import { create } from 'zustand';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const LOCK_ENABLED_KEY = 'ev_lock_enabled';

interface LockState {
  /** Whether the biometric/PIN lock is enabled by the user. */
  enabled: boolean;
  /** Whether the app is currently locked (must authenticate to view). */
  locked: boolean;
  /** Whether the device supports any local authentication. */
  supported: boolean;
  init: () => Promise<void>;
  setEnabled: (v: boolean) => Promise<void>;
  lock: () => void;
  unlock: () => Promise<boolean>;
}

export const useLockStore = create<LockState>((set, get) => ({
  enabled: false,
  locked: false,
  supported: false,

  init: async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const supported = hasHardware && enrolled;
    const stored = await SecureStore.getItemAsync(LOCK_ENABLED_KEY);
    const enabled = supported && stored === '1';
    set({ supported, enabled, locked: enabled });
  },

  setEnabled: async (v: boolean) => {
    await SecureStore.setItemAsync(LOCK_ENABLED_KEY, v ? '1' : '0');
    set({ enabled: v, locked: v ? get().locked : false });
  },

  lock: () => {
    if (get().enabled) set({ locked: true });
  },

  unlock: async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock EvidenceVault',
      fallbackLabel: 'Use device passcode',
    });
    if (result.success) {
      set({ locked: false });
      return true;
    }
    return false;
  },
}));
