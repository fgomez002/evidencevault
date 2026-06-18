import { Platform } from 'react-native';
import Constants from 'expo-constants';
import Purchases, {
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';

/**
 * RevenueCat integration for App Store + Google Play in-app subscriptions.
 *
 * The "premium" entitlement is configured in the RevenueCat dashboard and
 * attached to the store products. The app reads entitlement state from
 * RevenueCat rather than trusting the device — RevenueCat validates receipts
 * server-side. See REVENUECAT.md for the store + dashboard setup.
 *
 * Public SDK keys (safe to ship) come from env:
 *   EXPO_PUBLIC_REVENUECAT_IOS_KEY / EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
 */

export const ENTITLEMENT_ID = 'premium';

const iosKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
const androidKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

// react-native-purchases is a native module — it can't run in Expo Go.
// Requires a development/production build (EAS). Guard so the app still loads.
const isExpoGo = Constants.appOwnership === 'expo';
const apiKey = Platform.OS === 'ios' ? iosKey : androidKey;

export const isPurchasesAvailable = (): boolean => !isExpoGo && !!apiKey;

let configured = false;

export async function configurePurchases(): Promise<boolean> {
  if (!isPurchasesAvailable() || configured) return configured;
  try {
    if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.WARN);
    Purchases.configure({ apiKey: apiKey! });
    configured = true;
  } catch (e) {
    console.warn('[purchases] configure failed:', e);
  }
  return configured;
}

/** Map the RevenueCat user to the signed-in Supabase user so entitlements follow the account. */
export async function identifyPurchasesUser(userId: string): Promise<void> {
  if (!configured) return;
  try {
    await Purchases.logIn(userId);
  } catch (e) {
    console.warn('[purchases] logIn failed:', e);
  }
}

export async function resetPurchasesUser(): Promise<void> {
  if (!configured) return;
  try {
    await Purchases.logOut();
  } catch {
    // logging out an anonymous user throws — safe to ignore
  }
}

export function hasPremium(info: CustomerInfo): boolean {
  return info.entitlements.active[ENTITLEMENT_ID] != null;
}

export async function refreshPremium(): Promise<boolean> {
  if (!configured) return false;
  try {
    const info = await Purchases.getCustomerInfo();
    return hasPremium(info);
  } catch (e) {
    console.warn('[purchases] getCustomerInfo failed:', e);
    return false;
  }
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  if (!configured) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch (e) {
    console.warn('[purchases] getOfferings failed:', e);
    return null;
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return hasPremium(customerInfo);
}

export async function restorePurchases(): Promise<boolean> {
  const info = await Purchases.restorePurchases();
  return hasPremium(info);
}

/** Subscribe to entitlement changes (e.g. renewals, expirations). Returns an unsubscribe fn. */
export function onPremiumChange(cb: (premium: boolean) => void): () => void {
  if (!configured) return () => {};
  const listener = (info: CustomerInfo) => cb(hasPremium(info));
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => Purchases.removeCustomerInfoUpdateListener(listener);
}

export type { PurchasesOffering, PurchasesPackage };
