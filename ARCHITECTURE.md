# Architecture & Security Design

EvidenceVault is built with privacy, security, and credibility as first-class concerns. This document outlines the system design, encryption model, and threat mitigations.

---

## Guiding Principles

1. **Privacy first.** Users may be documenting abuse, harassment, or trauma. The app must feel and be secure.
2. **Credibility / chain of custody.** Cryptographic integrity (hashes, timestamps, audit logs) make the record useful to attorneys or investigators.
3. **Minimal data collection.** No analytics, no tracking, no telemetry on content.
4. **Fail secure.** When in doubt, encrypt harder or delete faster.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     EvidenceVault Mobile App                     │
│                    (Expo SDK 51, TypeScript)                     │
├─────────────────────────────────────────────────────────────────┤
│  UI Layer            │ Routes (Expo Router), Screens, Components │
├──────────────────────┼──────────────────────────────────────────┤
│  Business Logic      │ TanStack Query (server state)             │
│                      │ Zustand (app lock, subscription)          │
├──────────────────────┼──────────────────────────────────────────┤
│  Security & Crypto   │ expo-crypto (SHA-256)                     │
│                      │ libsodium (XChaCha20-Poly1305)            │
│                      │ expo-secure-store (key storage)           │
├──────────────────────┼──────────────────────────────────────────┤
│  Device Integration  │ Face ID / fingerprint (expo-local-auth)   │
│                      │ Camera / audio / location (native APIs)   │
└─────────────────────────────────────────────────────────────────┘
                              │
                    HTTPS + TLS 1.3
                              │
       ┌──────────────────────┴──────────────────────┐
       │                                              │
    ┌──────────────────────┐         ┌───────────────────────┐
    │    Supabase Postgres │         │  Supabase Storage     │
    │  (RLS, at-rest enc)  │         │  (S3, private bucket) │
    └──────────────────────┘         └───────────────────────┘
       │                                      │
       ├─ incidents (text metadata)           ├─ evidence_files (encrypted blobs)
       ├─ evidence_files (metadata)           │
       ├─ witnesses, police_reports           └─ Encryption keys never uploaded
       ├─ integrity_log (audit trail)
       ├─ profiles (subscription)
       └─ check_ins, panic_events
       │
       └─────────────────────┬──────────────────────┐
                             │                      │
                ┌────────────────────┐  ┌──────────────────────┐
                │  Edge Functions    │  │   Webhooks           │
                │  (ai-assistant)    │  │   (RevenueCat sync)  │
                └────────────────────┘  └──────────────────────┘
```

### Layers

#### 1. **App Layer** (Expo + React Native)
- File-based routing via Expo Router
- Biometric app lock (Face ID / fingerprint)
- Camera, audio, location capture
- Offline-first state with TanStack Query

#### 2. **Encryption Layer**
- **SHA-256:** Integrity hashing (capture time, chain-of-custody)
- **XChaCha20-Poly1305:** AEAD encryption for evidence files
- **Argon2id:** Passphrase key derivation (optional E2E upgrade)
- **expo-secure-store:** Hardware-backed key storage in Keychain / Keystore

#### 3. **Backend** (Supabase / Postgres)
- **Row-level security (RLS):** Every table restricted to `user_id = auth.uid()`
- **At-rest encryption:** Supabase PostgreSQL encryption (default)
- **Auth:** Email/password via Supabase Auth
- **Storage:** Private S3 bucket for encrypted evidence files

#### 4. **Integration**
- **RevenueCat:** Mobile IAP via Apple + Google
- **Anthropic Claude:** Incident summaries, keyword search (edge function)
- **Twilio:** (Optional) panic SMS to contacts

---

## Encryption & Integrity Model

### Evidence Files (Hybrid E2E)

**Goal:** Evidence *media* is encrypted so the server can't read it. Metadata is in Postgres for fast search + AI.

**Flow at capture:**

1. User captures photo / video / audio / document
2. App generates a random **nonce** (24 bytes)
3. Derives or retrieves the **encryption key** from `expo-secure-store`
4. Encrypts the file blob: `ciphertext = XChaCha20-Poly1305(plaintext, nonce, key)`
5. Computes SHA-256: `hash = SHA256(plaintext)` — recorded at *capture time*
6. Uploads `ciphertext` to Supabase Storage at path `evidence/<user_id>/<uuid>`
7. Stores metadata in DB:
   ```sql
   INSERT INTO evidence_files (
     incident_id, kind, storage_path, sha256, captured_at, 
     enc_metadata, caption, ...
   ) VALUES (
     ..., ..., 'evidence/user-uuid/file-uuid', 'abc123...', NOW(),
     '{"nonce": "...base64...", "key_wrap": {...}}'::jsonb,
     ...
   )
   ```
8. Logs the action: `INSERT INTO integrity_log (action='created', sha256_after='abc123...')`

**At export/view:**

1. Fetch encrypted blob from Storage
2. Retrieve `nonce` and key from `exc_metadata` / `expo-secure-store`
3. Decrypt: `plaintext = XChaCha20-Poly1305.decrypt(ciphertext, nonce, key)`
4. Verify: `SHA256(plaintext) == stored_hash` ✅
5. Log the access: `INSERT INTO integrity_log (action='viewed', sha256_before='abc123...')`

**Key derivation (encryption master key):**

- Derived once at login from user's password + stored salt
- Kept in `expo-secure-store` (Keychain / Keystore) — never in RAM
- Rotation possible but requires re-encrypting all files (not implemented yet)

### Integrity Log (Chain of Custody)

Every access is logged in an **append-only** table:

```sql
CREATE TABLE integrity_log (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  entity_type text,            -- 'evidence', 'incident', 'report'
  entity_id uuid,
  action text,                 -- 'created', 'viewed', 'modified', 'exported'
  sha256_before text,          -- hash before modification
  sha256_after text,           -- hash after modification
  occurred_at timestamptz,
  device_label text,           -- device name / OS version
  created_at timestamptz DEFAULT NOW()
);
```

Logs are **immutable** (RLS only allows INSERT, never UPDATE/DELETE). At export, users get an **Integrity Report** PDF listing:
- Each file's hash and capture time
- All views/modifications with timestamps
- Device info
- Cryptographically signed (QR code or signature field — future)

---

## Authentication & Session Management

### Login Flow

1. User enters email + password
2. Supabase Auth verifies and returns `access_token` (JWT) + `refresh_token`
3. Tokens stored in `expo-secure-store` (encrypted on device)
4. App checks `auth.uid()` and creates/updates `profiles` row

### Biometric App Lock (Optional)

1. At first login, user optionally enrolls Face ID / fingerprint
2. A random **app lock PIN** (e.g., 6 digits) is generated and stored in `expo-secure-store`
3. On each app foreground, user must unlock:
   - Face ID / fingerprint → biometric matches → PIN verified
   - If no biometric enrolled, PIN entry only
4. Lock is enforced at the app root (before any routes are rendered)

**No server communication** for biometric unlock (all device-local via `expo-local-authentication`).

---

## Row-Level Security (RLS)

Every table enforces:

```sql
CREATE POLICY "Users can only access their own data" 
  ON incidents FOR ALL 
  USING (user_id = auth.uid());
```

This prevents:
- User A from seeing User B's incidents
- User A from accessing User B's storage
- Unauth'd requests (even with admin key) from leaking data

**Critical:** RLS is the *only* authorization layer. No field-level encryption is needed if RLS is correct.

---

## Storage & Bucket Security

### S3 Bucket: `evidence`

```
evidence/
  <user-uuid>/
    <file-uuid>   ← encrypted blob (ciphertext)
```

**RLS (Storage Policy):**

```sql
-- Allow users to read/write only their own path
SELECT (auth.uid()::text = (string_to_array(name, '/'))[2])
INSERT (auth.uid()::text = (string_to_array(name, '/'))[2])
UPDATE (auth.uid()::text = (string_to_array(name, '/'))[2])
DELETE (auth.uid()::text = (string_to_array(name, '/'))[2])
```

Files are **never public.** Even with the storage URL, you can't access a file without a valid Supabase session.

---

## Data Model & Relationships

### Core Tables

#### `profiles`
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  subscription_tier text DEFAULT 'free',  -- 'free' | 'premium'
  storage_used_bytes bigint DEFAULT 0,
  check_in_settings jsonb,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);
```

#### `incidents`
```sql
CREATE TABLE incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  occurred_at timestamptz,
  category text,  -- enum: 'harassment', 'injury', 'threat', 'other'
  title text NOT NULL,
  notes text,
  emotional_impact text,
  follow_up_actions text,
  latitude float8,
  longitude float8,
  location_label text,
  status text DEFAULT 'open',  -- 'open' | 'closed' | 'reported'
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);
```

#### `evidence_files`
```sql
CREATE TABLE evidence_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  incident_id uuid REFERENCES incidents(id) ON DELETE SET NULL,
  kind text NOT NULL,  -- 'photo' | 'video' | 'audio' | 'document' | ...
  storage_path text NOT NULL,  -- evidence/<user-uuid>/<file-uuid>
  original_filename text,
  mime_type text,
  size_bytes bigint,
  sha256 text NOT NULL,  -- hash of plaintext (for integrity)
  captured_at timestamptz NOT NULL,
  enc_metadata jsonb,  -- { nonce, key_wrap, ... }
  caption text,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);
```

#### `integrity_log` (Append-only)
```sql
CREATE TABLE integrity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type text,  -- 'evidence' | 'incident' | 'report'
  entity_id uuid,
  action text,  -- 'created' | 'viewed' | 'modified' | 'exported'
  sha256_before text,
  sha256_after text,
  occurred_at timestamptz NOT NULL,
  device_label text,
  created_at timestamptz DEFAULT NOW()
);
```

*See [PLAN.md](PLAN.md) for the full schema.*

---

## Threat Model & Mitigations

### Threat: Unencrypted evidence on the server

**Mitigation:** Client-side XChaCha20-Poly1305 encryption before upload. Server stores ciphertext only.

**Residual risk:** Metadata (dates, times, categories, notes) is in Postgres for search. A compromised DB can read this. *Acceptable for MVP; can upgrade to full E2E with Argon2id key derivation later.*

### Threat: Lost encryption key / forgotten password

**Mitigation:** Encryption key is derived from the user's Supabase password. Normal password-reset flow recovers it.

**Residual risk:** If the user forgets their password AND doesn't have a recovery seed, they lose access. *This is a usability trade-off; could implement a recovery key at signup in the future.*

### Threat: App uninstall / device theft

**Mitigation:** Keys stored in Keychain (iOS) / Keystore (Android) are wiped on uninstall. Device-level encryption (iPhone's Data Protection, Android's FBE) protects at-rest.

**Residual risk:** If a thief physically extracts the Keystore without wipe-on-theft enabled, they might recover it. *This is a device OS limitation; mitigate with strong biometric + PIN.*

### Threat: Man-in-the-middle (MITM) attack

**Mitigation:**
- All traffic is HTTPS + TLS 1.3 (pinned in Expo config)
- Supabase enforces TLS 1.2+ with strong ciphers
- JWT `access_token` is short-lived (1 hour)

**Residual risk:** If the user is on an insecure WiFi network and the TLS cert is compromised, traffic could be observed. *Mitigate with app-level cert pinning (future).*

### Threat: Malicious Supabase operator

**Mitigation:**
- Encrypted files are stored encrypted; operator can't read plaintext media
- RLS prevents cross-user access at the DB layer
- Integrity log is append-only (immutable by design)

**Residual risk:** Operator could read metadata (dates, categories, notes) from the Postgres DB. *This is accepted for MVP; full E2E would require moving all text fields into the encrypted blob.*

### Threat: App source code is leaked / app is reverse-engineered

**Mitigation:**
- Encryption keys are derived from user password + random salt; not hardcoded
- Supabase keys are *public* (anon key, RLS-protected, can't write)
- No API secrets are in the app binary

**Residual risk:** An attacker with the app source code could try to brute-force passwords offline. *Mitigate with strong password hashing (Argon2id for future E2E mode).*

### Threat: Biometric spoofing / device theft

**Mitigation:**
- Biometric unlock is device-level (via `expo-local-authentication`)
- PIN is still required after biometric fails
- Device lock screen is enforced

**Residual risk:** An attacker with a stolen device and biometric sensor spoofing tools could unlock. *This is a device OS limitation; mitigate with strong PIN + app kill on timeout.*

---

## API Endpoints

### Authentication (Supabase Auth)

All auth flows go via Supabase Auth REST API (handled by the Supabase SDK):

- `POST /auth/v1/signup` — Register with email + password
- `POST /auth/v1/token?grant_type=password` — Login
- `POST /auth/v1/token?grant_type=refresh_token` — Refresh session

### Data APIs (REST)

All CRUD operations go via Supabase REST API with RLS:

- `GET /rest/v1/incidents` — List user's incidents (RLS filters to user_id)
- `POST /rest/v1/incidents` — Create incident
- `PATCH /rest/v1/incidents/{id}` — Update incident
- `DELETE /rest/v1/incidents/{id}` — Delete incident
- *Same patterns for `evidence_files`, `witnesses`, `integrity_log`, etc.*

### Edge Functions

#### `ai-assistant`

- **Endpoint:** `https://<project>.supabase.co/functions/v1/ai-assistant`
- **Auth:** JWT `Authorization: Bearer <token>`
- **Request:** `POST { "incident_id": "...", "prompt": "..." }`
- **Response:** `{ "summary": "...", "keywords": [...] }`
- **Rate limit:** 10 calls / day for free tier, unlimited for premium

**Implementation:**
```typescript
// supabase/functions/ai-assistant/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

serve(async (req) => {
  if (req.method !== "POST") return new Response("Not allowed", { status: 405 });
  
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  const { data: { user }, error } = await supabase.auth.getUser(token!);
  if (error || !user) return new Response("Unauthorized", { status: 401 });
  
  const { incident_id, prompt } = await req.json();
  
  // Fetch incident (RLS will filter if not user's own)
  const { data: incident, error: fetchErr } = await supabase
    .from("incidents")
    .select("*")
    .eq("id", incident_id)
    .eq("user_id", user.id)
    .single();
  
  if (fetchErr || !incident) return new Response("Not found", { status: 404 });
  
  // Call Claude API
  const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });
  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 500,
    system: "You are a helpful assistant for analyzing incident documentation.",
    messages: [
      {
        role: "user",
        content: `Incident: "${incident.title}"\nNotes: ${incident.notes}\n\nQuestion: ${prompt}`
      }
    ]
  });
  
  return new Response(JSON.stringify({
    summary: message.content[0].type === "text" ? message.content[0].text : ""
  }), { headers: { "Content-Type": "application/json" } });
});
```

#### `revenuecat-webhook`

- **Endpoint:** `https://<project>.supabase.co/functions/v1/revenuecat-webhook`
- **Auth:** Custom header `Authorization: <REVENUECAT_WEBHOOK_AUTH>`
- **Request:** RevenueCat webhook payload (purchase, renewal, cancellation)
- **Action:** Updates `profiles.subscription_tier` based on entitlement status

---

## Performance & Optimization

### Bundle Size

Target: <1.5 MB (React Native bundle)

**Current:** ~1.5 MB

**Optimizations:**
- Tree-shaking unused libraries
- Lazy loading for heavy modules (PDF export)
- Image compression (JPEG for photos, WebP for thumbnails)

### Database Queries

**N+1 prevention:**
- Use `TanStack Query` for batching and caching
- Index on `user_id` + `created_at` for incident lists
- Cache incident metadata in React Query

**Example query (fast path):**
```sql
SELECT id, title, occurred_at FROM incidents
WHERE user_id = $1 AND created_at > $2
ORDER BY created_at DESC
LIMIT 50;
```

### Encryption Performance

- SHA-256 hashing: ~1 ms per MB (acceptable)
- XChaCha20-Poly1305: ~5 ms per MB (via libsodium, hardware-accelerated)

For typical 5–10 MB files, total encryption time is ~50 ms (not blocking).

---

## Compliance & Legal

### GDPR

- Users can request data export (implement via PDF report)
- Users can request account deletion (RLS + cascade triggers handle this)
- Privacy policy links to security architecture

### HIPAA (if used for medical incidents)

- All data is encrypted at rest + in transit
- Audit trail (integrity_log) tracks all access
- Missing: Business Associate Agreement (BAA) — not yet compliant, but architecture supports it

### CCPA

- Users have right to know (data export)
- Users have right to delete (cascading deletes)
- No data sharing with third parties (Anthropic is a processor; all queries are anonymized)

---

## Deployment & Ops

### Monitoring & Logging

- Supabase dashboard: function logs, query performance, storage usage
- Client-side: Sentry (optional, for crash reporting)

### Disaster Recovery

- **Backups:** Supabase auto-backups (daily, 7-day retention for Pro)
- **Recovery time objective (RTO):** 24 hours (standard Supabase SLA)
- **Recovery point objective (RPO):** Data loss up to 1 day (mitigated by daily backups)

### Scaling

- **User growth:** Supabase handles up to 1M+ users on Pro tier
- **Storage:** Evidence files are stored in S3 (unlimited scaling)
- **Edge Functions:** Deno runtime scales automatically; billed by invocation + duration

---

## Future Security Upgrades

1. **Full E2E (Option A):** Implement Argon2id key derivation so user's master key is never sent to server. Requires client-side search (local decryption).

2. **Cert Pinning:** Add TLS certificate pinning in the Expo app.json to prevent MITM attacks.

3. **Signature & Attestation:** Sign the Integrity Report with a device signature (Secure Enclave on iOS, StrongBox on Android) for court admissibility.

4. **Biometric Passphrase:** Replace PIN with continuous biometric unlock (continuous authentication).

5. **Whistleblower Mode:** Anonymous incident recording that never links to the user's account (Tor-like routing, ephemeral identity).

---

## References

- [Supabase Security](https://supabase.com/docs/guides/self-hosting/security)
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-top-10/)
- [Libsodium Documentation](https://doc.libsodium.org/)
- [Expo Security](https://docs.expo.dev/guides/authentication/)

---

**Last updated:** June 2026  
**Maintainer:** hvacandroof@gmail.com
