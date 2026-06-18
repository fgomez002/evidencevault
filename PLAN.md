# EvidenceVault — Architecture & Build Plan

> Personal-safety incident documentation app. Mobile-first (Expo/React Native), Supabase backend.
> Goal: give users a secure, credible, court-ready record of incidents, evidence, and reports.

---

## 1. Guiding principles

1. **Privacy and security first.** This app holds sensitive, potentially traumatic data. Users may feel unsafe. The product must *feel* and *be* secure: biometric app lock, client-side encryption of evidence, minimal data collection, no analytics on content.
2. **Credibility / chain of custody.** The differentiator vs. a notes app is *integrity*: every piece of evidence gets a timestamp + SHA-256 hash recorded at capture, and modifications are logged. This is what makes the record useful to an attorney or investigator.
3. **Calm, serious, modern UI.** Not alarmist. Dark-default, clean, trustworthy. Reduce cognitive load — users may be documenting under stress.
4. **Ship in phases.** A usable MVP (journal + evidence + timeline) before advanced/AI/subscription features.

---

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| App framework | **Expo (SDK 51, managed)** + **Expo Router** | Matches your existing Jesus Rey app env; file-based routing; OTA updates |
| Language | **TypeScript** | Type safety across schema + UI |
| Navigation | Expo Router (file-based) | Stack + tabs |
| Server state | **TanStack Query** | Caching, offline, sync with Supabase |
| Local/UI state | **Zustand** | Lightweight global state (lock state, capture session) |
| Backend | **Supabase** | Postgres + Auth + Storage + RLS + Edge Functions |
| Forms | React Hook Form + Zod | Validation matching DB constraints |
| Secure key storage | **expo-secure-store** | Stores encryption keys / app-lock secret in Keychain/Keystore |
| App lock | **expo-local-authentication** | Face ID / fingerprint / PIN gate |
| Crypto | **expo-crypto** (SHA-256, random) + **libsodium** (XChaCha20-Poly1305) | Hashing + client-side encryption |
| Location | **expo-location** | GPS capture |
| Camera/media | **expo-camera**, **expo-image-picker**, **expo-av** (audio/video) | Photos, video, audio recordings |
| Documents | **expo-document-picker**, **expo-file-system** | PDFs, reports, local file handling |
| PDF export | **expo-print** + **expo-sharing** | Generate case-file PDFs |
| Notifications | **expo-notifications** + **expo-task-manager** | Check-in reminders, panic alerts |
| SMS / contacts | **expo-sms** | Panic message to trusted contacts |
| AI | **Claude API** (via Supabase Edge Function) | Summaries, pattern detection, report drafting |
| Payments | **RevenueCat** (mobile IAP) — see §9 | Apple/Google require IAP for digital subs |

---

## 3. Data model (Supabase / Postgres)

All tables have `id uuid pk`, `user_id uuid` (= `auth.uid()`), `created_at`, `updated_at`. **RLS on every table**: `user_id = auth.uid()` for all operations.

- **profiles** — `display_name`, `subscription_tier` (`free`|`premium`), `storage_used_bytes`, `check_in_settings jsonb`
- **incidents** — `occurred_at`, `category` (enum), `title`, `notes` (text), `emotional_impact` (text), `follow_up_actions` (text), `latitude`, `longitude`, `location_label`, `status`
- **evidence_files** — `incident_id` (nullable fk), `kind` (`photo`|`video`|`audio`|`document`|`screenshot`|`police_report`|`medical_report`|`legal_document`), `storage_path`, `original_filename`, `mime_type`, `size_bytes`, `sha256`, `captured_at`, `enc_metadata jsonb` (nonce/key-wrap info), `caption`
- **tags** — `name`, `color`
- **evidence_tags** — join (`evidence_id`, `tag_id`)
- **witnesses** — `name`, `phone`, `email`, `event_date`, `written_statement`, `audio_evidence_id` (fk), `notes`
- **witness_documents** — join witness ↔ evidence_files
- **police_reports** — `report_number`, `agency`, `officer_name`, `officer_badge`, `filed_at`, `status` (`filed`|`investigating`|`closed`|`no_action`), `follow_up_notes`, `incident_id` (nullable)
- **contacts** — `name`, `relationship` (`family`|`friend`|`attorney`|`therapist`|`investigator`|`emergency`|`other`), `phone`, `email`, `is_panic_recipient bool`, `notes`
- **check_ins** — `scheduled_at`, `window_minutes`, `status` (`pending`|`confirmed`|`missed`), `notified_at`
- **panic_events** — `triggered_at`, `latitude`, `longitude`, `message`, `recipients jsonb`, `delivered bool`
- **integrity_log** — append-only: `entity_type`, `entity_id`, `action` (`created`|`viewed`|`modified`|`exported`), `sha256_before`, `sha256_after`, `occurred_at`, `device_label`. (Chain-of-custody trail.)

**Storage buckets:** `evidence` (private, RLS by path prefix `=<user_id>/...`). Files uploaded **already encrypted** client-side.

Enums created as Postgres enums or check constraints. Migrations managed via Supabase MCP (`apply_migration`) into a **new dedicated project** (separate from Jesus Rey).

---

## 4. Encryption & integrity design  ⚠️ key decision — see §10

**Integrity (always on):**
- At capture, compute **SHA-256** of the original bytes → stored on `evidence_files.sha256` and in `integrity_log` as `created`.
- Every view/modify/export writes an `integrity_log` row. Export produces a signed **Integrity Report** (PDF) listing each file, its hash, capture time, and device.

**Encryption — two options to choose between:**

- **Option A — Full E2E (zero-knowledge):** A master key is derived from the user's passphrase (Argon2id) at login and held only in `expo-secure-store`. Evidence blobs AND text fields are encrypted client-side; Supabase stores ciphertext only. *Pro:* server can't read anything. *Con:* lost passphrase = unrecoverable data; server-side search/AI impossible (must do client-side); more complex recovery UX.
- **Option B — Hybrid (recommended for MVP):** Evidence **files** encrypted E2E before upload (blobs unreadable to server). **Text metadata** (notes, categories, dates) stored in Postgres protected by RLS + Supabase at-rest encryption — readable by server, enabling fast search and AI features. *Pro:* keeps the strongest protection on the actual media, keeps search/AI/reporting practical, recoverable via normal auth. *Con:* incident text is technically readable by the DB operator.

> Default in this plan: **Option B**, with an optional "encrypt notes too" toggle as a later upgrade. This is flagged for your decision.

---

## 5. Design system

- **Theme:** dark default (deep slate `#0B1220` bg, elevated `#16202E` surfaces), light theme available. Accent: **teal/indigo** (trust, calm — not red/alarm except for panic UI).
- **Typography:** system font, clear hierarchy, generous spacing.
- **Components:** Card, ListRow, CategoryChip, Timeline node, EvidenceThumb, SecureBadge (shows hash-verified ✓), FAB for quick "+ Incident".
- **Panic UI** is the *only* place red is used, and it's deliberate and confirmable (hold-to-trigger to avoid accidents).
- Accessibility: large tap targets, high contrast, haptics on key actions.

---

## 6. App structure (Expo Router)

```
app/
  _layout.tsx            # root: auth gate + app-lock gate + theme + query client
  (auth)/                # sign in / sign up / passphrase setup
  (app)/
    _layout.tsx          # bottom tabs
    index.tsx            # Home / dashboard (quick add, check-in status, recent)
    timeline.tsx         # Timeline view (events + evidence + reports merged)
    incidents/           # list, [id], new, edit
    vault/               # evidence grid, [id], upload, search
    witnesses/           # list, [id], new
    reports/             # police reports list/new + Report Generation (PDF)
    contacts/            # directory
    settings/            # security (lock, encryption), subscription, check-in config
  panic.tsx              # full-screen panic flow (hold to send)
src/
  lib/ supabase.ts, crypto.ts, hash.ts, location.ts, pdf.ts, ai.ts
  hooks/ (TanStack Query hooks per entity)
  components/ (design system)
  stores/ (zustand: lock, capture)
  theme/
supabase/
  migrations/
  functions/ ai-assistant/, panic-dispatch/, check-in-monitor/
```

---

## 7. Build phases

**Phase 0 — Foundations**
- Scaffold Expo + Expo Router + TS, theme/design system, Supabase project + auth, biometric app lock, profiles table.

**Phase 1 — MVP core** (the demo-able milestone)
- Incident Journal (CRUD, auto date/time, GPS capture, categories, notes/impact/follow-up).
- Evidence Vault (capture/upload photo/video/audio/doc, client-side encryption, SHA-256, tagging, search).
- Timeline View (merged chronological feed).

**Phase 2 — Records management**
- Witness Management, Police Report Tracker, Contact Directory.

**Phase 3 — Evidence Integrity System**
- integrity_log everywhere, exportable Integrity Report PDF.

**Phase 4 — Safety**
- Panic Button (GPS + SMS to panic recipients), Check-In System (scheduled + missed-check-in notification via Edge Function + push).

**Phase 5 — Report Generation**
- PDF case file, timeline report, evidence index, witness list, police report history.

**Phase 6 — AI Assistant + Smart Search**
- Edge Function → Claude API: summarize incidents, detect patterns, generate date-range reports, attorney-ready summaries. Smart search by date/location/person/vehicle/plate/keyword/type.

**Phase 7 — Subscriptions**
- Free (1 GB, journal, basic reports) vs Premium (unlimited, AI, PDF export, cloud backup, advanced search). Gating + paywall + RevenueCat.

---

## 8. Safety/legal notes baked into the product

- Onboarding disclaimer: app is a documentation tool, not legal advice; in emergencies call 911/local emergency services (panic button supplements, doesn't replace).
- Clear messaging about what E2E means (lost passphrase = lost data, if Option A).
- Consent screen before any AI processing (data leaves device to Claude API).
- Data export + full account deletion (user owns their data).

---

## 9. Things that need a real-world account / your input

- **Supabase:** I can create a *new* dedicated project via the connected Supabase tools (separate from Jesus Rey). Confirm org.
- **AI:** Needs an Anthropic API key stored as an Edge Function secret (not in the app). Premium-gated.
- **Payments:** Apple/Google require **in-app purchase** for digital subscriptions on mobile → **RevenueCat** is the standard wrapper (Stripe alone isn't allowed for iOS/Android digital goods). Stripe would only apply to a future web version.
- **Panic SMS:** `expo-sms` opens the user's messaging app (user taps send) in managed Expo. Fully automated background SMS needs a dev build + a gateway (e.g., Twilio via Edge Function) — decision for Phase 4.

---

## 10. Decisions I need from you before coding

1. **Encryption model:** Option A (full zero-knowledge E2E) vs **Option B (hybrid, recommended)**.
2. **Supabase project:** create a new one now, or you'll provision it?
3. **Phase 1 scope confirmation:** Incident Journal + Evidence Vault + Timeline as the first shippable milestone — good?
