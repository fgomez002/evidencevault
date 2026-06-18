# In-App Subscriptions — RevenueCat Setup

EvidenceVault Premium is sold as an auto-renewing subscription through the **App Store**
and **Google Play**, brokered by **RevenueCat**. Apple and Google require their own IAP for
digital subscriptions, so this is the only compliant path on mobile.

The code is already wired:
- [`src/lib/purchases.ts`](src/lib/purchases.ts) — RevenueCat SDK wrapper
- [`src/stores/subscriptionStore.ts`](src/stores/subscriptionStore.ts) — entitlement state
- [`app/(app)/paywall.tsx`](app/(app)/paywall.tsx) — real offerings, purchase, restore
- [`supabase/functions/revenuecat-webhook`](supabase/functions/revenuecat-webhook) — syncs `profiles.subscription_tier` (deployed)

What's left is account/store configuration. Until you finish it, the paywall shows a **demo
toggle** and everything else works.

> ⚠️ IAP **cannot** run in Expo Go — you need a development build (`eas build --profile development`).

---

## 1. Store products

**App Store Connect** → your app → Subscriptions → create a group, then add an auto-renewing
subscription, e.g. product ID `evidencevault_premium_monthly`. Set price (e.g. $4.99). Fill in
the localization + review info so it's "Ready to Submit".

**Google Play Console** → Monetize → Subscriptions → create a subscription with the **same**
product ID `evidencevault_premium_monthly`, add a base plan (monthly, auto-renewing) and price.

(Optional: add an annual product `evidencevault_premium_annual` the same way.)

---

## 2. RevenueCat dashboard

1. Create a project. Add two apps: **iOS** (bundle `com.evidencevault.app`) and **Android**
   (package `com.evidencevault.app`).
   - iOS: upload your App Store Connect **In-App Purchase key** (.p8) + issuer/key IDs.
   - Android: connect Play via a **Google service-account JSON** with the right grants.
2. **Products** → import `evidencevault_premium_monthly` (and annual) from each store.
3. **Entitlements** → create one with identifier **`premium`** and attach the products to it.
   (The app checks exactly this identifier — see `ENTITLEMENT_ID` in `purchases.ts`.)
4. **Offerings** → create the **current** offering and add a package (e.g. Monthly) pointing at
   the product. The paywall renders whatever packages the current offering exposes.
5. **API keys** → copy the **public app-specific** keys (`appl_…` for iOS, `goog_…` for Android).

Put them in `.env`:

```
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxxxxx
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxxxxxxx
```

---

## 3. Server sync webhook (already deployed)

The `revenuecat-webhook` function is live. Wire it up:

1. Pick a long random string as a shared secret, then set it on Supabase:
   ```
   supabase secrets set REVENUECAT_WEBHOOK_AUTH=<long-random-string> --project-ref flmwxsanyanpkcpefjfb
   ```
2. RevenueCat dashboard → **Integrations → Webhooks**:
   - URL: `https://flmwxsanyanpkcpefjfb.supabase.co/functions/v1/revenuecat-webhook`
   - **Authorization header**: the same `<long-random-string>`.

Now renewals, cancellations, and expirations update `profiles.subscription_tier` automatically.
(The app already reflects entitlements instantly via the SDK; this keeps the DB authoritative.)

---

## 4. Build & test

```bash
# one-time
npm install -g eas-cli && eas login && eas build:configure

# dev build with the native IAP module
eas build --profile development --platform ios       # or android
```

Install the dev build, open the paywall, and buy with a **sandbox** account
(App Store Sandbox tester / Play License tester). After purchase, the gated features
(AI assistant, full case-file PDF) unlock. "Restore purchases" recovers an existing sub.

---

## Where Premium is enforced

`useSubscription().isPremium` is the single check, true when **any** of:
`override` (demo) · RevenueCat `premium` entitlement · `profiles.subscription_tier = 'premium'`.

It currently gates: the **AI assistant** and the **full case-file PDF export**. Add more gates by
calling `useSubscription()` in any screen.
