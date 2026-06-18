# EvidenceVault

A secure, private incident-documentation app for personal-safety situations. Mobile-first
(Expo / React Native + TypeScript) with Supabase for auth, cloud sync, and encrypted storage.

> EvidenceVault is a documentation tool — **not** legal advice or an emergency service.
> In an emergency, contact your local emergency number.

## Status

**All phases (0–7) complete.** See [PLAN.md](PLAN.md) for the full architecture.

Implemented:
- **Auth + biometric app lock** (Face ID / fingerprint, auto-relock on background)
- **Incident Journal** — categories, notes, emotional impact, follow-up, GPS capture
- **Evidence Vault** — photo / video / audio / document capture, client-side encryption,
  SHA-256 chain-of-custody, search & filtering
- **Timeline** — merged chronological view of incidents + evidence
- **Witness Management** — statements + contact info, call/email actions
- **Police Report Tracker** — report #, agency, officer, badge, status workflow
- **Contact Directory** — grouped by relationship, call/text/email, panic-recipient flag
- **Reports & export** — PDF case file, integrity report, timeline, evidence index,
  witness list, police-report history (`expo-print`)
- **Panic button** — hold-to-trigger, GPS + SMS to panic recipients
- **Check-ins** — scheduled safety check-ins with local notification reminders
- **AI assistant** — summaries, pattern detection, attorney-ready reports
  (Supabase Edge Function → Claude API; premium-gated, consent-gated)
- **Smart search** — one search across incidents, evidence, witnesses, reports
- **Subscriptions** — Free vs Premium with feature gating + paywall
- Dark-default design system, integrity logging, RLS-scoped data model

## Security model (Hybrid — see PLAN.md §4)

- Evidence **files** are encrypted on-device (XSalsa20-Poly1305 / NaCl secretbox) before upload.
  Supabase Storage only ever stores ciphertext.
- The vault key lives in the device Keychain/Keystore via `expo-secure-store`.
- Every file is SHA-256 hashed at capture; the hash is re-verified on open and recorded in an
  append-only `integrity_log` (insert/select-only) for a verifiable chain of custody.
- Incident **text** is stored in Postgres under Row Level Security to keep search and future
  AI/reporting features fast.

## Getting started

```bash
npm install

# Configure Supabase (see PLAN.md §9 — a project still needs to be provisioned)
cp .env.example .env
#   EXPO_PUBLIC_SUPABASE_URL=...
#   EXPO_PUBLIC_SUPABASE_ANON_KEY=...

npm start            # Expo dev server (scan QR with Expo Go / dev build)
npm run typecheck    # tsc --noEmit
```

Without Supabase configured, the app boots in **demo mode** so the UI can be reviewed; auth and
cloud sync are disabled until a project is connected.

## Database

SQL migrations live in `supabase/migrations/`:
- `0001_init.sql` — schema, enums, triggers
- `0002_rls.sql` — Row Level Security policies
- `0003_storage.sql` — private `evidence` bucket + storage policies

Apply them to a Supabase project (CLI `supabase db push`, the SQL editor, or the MCP tools).

## Project structure

```
app/                 Expo Router routes
  (auth)/            sign in / sign up
  (app)/(tabs)/      Home · Journal · Vault · Timeline
  (app)/incident/    new · [id] · edit
  (app)/evidence/    add · [id]
  (app)/settings/
src/
  components/ui/     design system
  hooks/             TanStack Query data hooks
  lib/               supabase, crypto, hash, base64, location, integrity
  providers/         Auth, Query
  stores/            zustand (app lock)
  theme/             tokens, categories
supabase/migrations/
```

## Remaining setup (not code — accounts/infra)

- **Provision Supabase** + apply the migrations (app runs in demo mode until then).
- **Deploy the AI Edge Function** (`supabase functions deploy ai-assistant`) and set
  `supabase secrets set ANTHROPIC_API_KEY=...` to enable the AI assistant.
- **RevenueCat in-app purchases** — code is wired (SDK, paywall, sync webhook). Remaining is
  store/dashboard config + a dev build. Full walkthrough in [REVENUECAT.md](REVENUECAT.md).
- **Panic SMS automation** (optional): a Twilio gateway via Edge Function for fully
  background sends; today `expo-sms` opens the composer for the user to send.
