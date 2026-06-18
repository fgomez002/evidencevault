# EvidenceVault — Project Status & Resume Guide

_Snapshot for picking the work back up later._

## Where things stand

**All app phases (0–7) are built, typechecked (`tsc` clean), and bundle cleanly (~1508 modules).**
Backend is provisioned and live. The app runs against real Supabase (not demo mode).

| Area | State |
|---|---|
| Auth + biometric app lock | ✅ done |
| Incident Journal | ✅ done |
| Evidence Vault (encrypt + SHA-256) | ✅ done |
| Timeline | ✅ done |
| Witnesses / Police reports / Contacts | ✅ done |
| Reports & PDF export (incl. integrity report) | ✅ done |
| Panic button + Check-ins | ✅ done |
| AI assistant + Smart search | ✅ done (needs API key — below) |
| Subscriptions / paywall | ✅ code done (needs store config — below) |

## Backend (Supabase) — LIVE

- Project **EvidenceVault**, ref **`flmwxsanyanpkcpefjfb`**, org "Faith Apps", region us-east-1 ($10/mo).
- URL: `https://flmwxsanyanpkcpefjfb.supabase.co`
- Keys live in `.env` (gitignored, kept on disk). Publishable key is public/RLS-protected.
- Migrations applied: `init_schema`, `rls_policies`, `storage_bucket`, `harden_functions`.
- Security advisors: **0 issues**. REST + Auth verified `200`.
- Edge functions deployed: **`ai-assistant`** (verify_jwt=true), **`revenuecat-webhook`** (verify_jwt=false).
- Dashboard: https://supabase.com/dashboard/project/flmwxsanyanpkcpefjfb

## ⏳ Pending — to do when resuming (all account/store side, no code)

1. **AI key** — set the Claude key as an Edge Function secret, then AI works (no redeploy):
   ```
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-... --project-ref flmwxsanyanpkcpefjfb
   ```
   (Dashboard: Project Settings → Edge Functions → Secrets.)

2. **In-app purchases** — follow [REVENUECAT.md](REVENUECAT.md):
   - Create store product `evidencevault_premium_monthly` (App Store Connect + Google Play).
   - RevenueCat dashboard: entitlement `premium` + current offering; copy public keys into `.env`
     (`EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `_ANDROID_KEY`).
   - Webhook secret + URL:
     ```
     supabase secrets set REVENUECAT_WEBHOOK_AUTH=<random> --project-ref flmwxsanyanpkcpefjfb
     ```
     RevenueCat → Webhooks → URL `…/functions/v1/revenuecat-webhook`, Authorization = same `<random>`.

3. **Dev build** (IAP can't run in Expo Go):
   ```
   eas login && eas build:configure
   eas build --profile development --platform ios   # or android
   ```

## Run it now (dev, against live Supabase)

```bash
cd D:\claude\EvidenceVault
npm install      # if node_modules is missing
npm start        # Expo dev server; open in Expo Go for everything except IAP/biometrics-on-sim
npm run typecheck
```

Account creation, incidents, encrypted evidence upload, PDF export all work against the real backend.

## Key files / map

- App routes: `app/(app)/(tabs)/` (Home, Journal, Vault, Timeline, More) + detail/modal routes.
- Security/crypto: `src/lib/{crypto,hash,base64,integrity}.ts`, `src/stores/lockStore.ts`.
- Data hooks: `src/hooks/use*.ts` (TanStack Query; **pinned `@tanstack/react-query@5.59.20`** — newer breaks types on Expo's TS 5.3).
- Reports/PDF: `src/lib/{pdf,reports}.ts` + `app/(app)/export/`.
- Safety: `app/(app)/panic.tsx`, `src/lib/panic.ts`, `app/(app)/checkin/`, `src/lib/notifications.ts`.
- AI: `supabase/functions/ai-assistant/`, `src/hooks/useAiAssistant.ts`, `app/(app)/assistant/`.
- Subscriptions: `src/lib/purchases.ts`, `src/stores/subscriptionStore.ts`, `app/(app)/paywall.tsx`,
  `supabase/functions/revenuecat-webhook/`.
- SQL: `supabase/migrations/0001…0003` (the 4th, `harden_functions`, was applied via MCP — add it here if you adopt CLI migrations).

## Gotchas to remember

- **Typed routes** (`.expo/types/router.d.ts`) only regenerate from `expo start` (dev server), **not**
  `expo export`. After adding routes, run the dev server once before `tsc`.
- **Hermes has no `btoa`/`atob`/`Buffer`** — base64 is hand-rolled in `src/lib/base64.ts`.
- IAP + biometric unlock need a real device / dev build, not Expo Go.

## Ideas / next features (optional)

- Add an annual product to the paywall.
- Store-listing copy + subscription legal text for App Store / Google Play.
- Twilio gateway for fully-automated background panic SMS (today opens the composer).
- Background task to auto-flag missed check-ins and notify panic contacts.
