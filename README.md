# EvidenceVault

**Secure incident documentation app** — a mobile-first platform for recording, organizing, and exporting incidents with cryptographic integrity verification. Built for personal safety, legal credibility, and chain-of-custody compliance.

- 🔐 **Client-side encryption** of evidence files
- ✅ **Cryptographic integrity** — SHA-256 hashing + tamper-proof timeline
- 📱 **Native mobile** — Expo SDK 51 (iOS + Android)
- 🔑 **Biometric app lock** — Face ID / fingerprint
- 🤖 **AI-powered search** — incident summaries and pattern detection
- 💳 **Subscriptions** — RevenueCat integration (in-app purchases)
- 📊 **Court-ready reports** — case-file PDFs with chain-of-custody audit trail

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Supabase CLI (for Edge Functions and migrations)

### Install & Run

```bash
git clone https://github.com/YOUR_ORG/evidencevault.git
cd evidencevault

npm install

# Set up environment variables
cp .env.example .env
# Fill in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY

# Start dev server (Expo Go)
npm start

# Open in Expo Go on your phone, or 'w' for web simulator
```

**Note:** In-app purchases require a development build, not Expo Go. See [Building for Production](#building-for-production).

---

## Project Structure

```
app/                          # Expo Router (file-based routing)
├── (auth)/                   # Sign-in, sign-up, biometric setup
├── (app)/                    # Main tabbed interface
│   ├── (tabs)/              # Home, Journal, Vault, Timeline, More
│   ├── [id]/                # Detail views
│   └── export/              # PDF generation
src/
├── lib/
│   ├── crypto.ts            # XChaCha20-Poly1305 encryption
│   ├── hash.ts              # SHA-256 hashing
│   ├── integrity.ts         # Integrity log & verification
│   ├── pdf.ts               # Report generation
│   └── purchases.ts         # RevenueCat IAP wrapper
├── hooks/
│   ├── useIncidents.ts      # TanStack Query for incidents
│   ├── useEvidence.ts       # Evidence + encryption
│   ├── useAiAssistant.ts    # Claude API integration
│   └── useSubscription.ts   # IAP & entitlements
├── stores/
│   ├── lockStore.ts         # App lock (biometric/PIN)
│   └── subscriptionStore.ts # Premium tier state
└── components/              # Reusable UI
supabase/
├── migrations/              # Schema + RLS policies
└── functions/
    ├── ai-assistant/        # Claude summaries & search
    └── revenuecat-webhook/  # Purchase sync
.github/
└── workflows/               # CI/CD pipelines
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **App** | Expo SDK 51, React Native, TypeScript |
| **Routing** | Expo Router (file-based) |
| **State** | TanStack Query (server), Zustand (local) |
| **Forms** | React Hook Form + Zod |
| **Backend** | Supabase (Postgres + Auth + Storage + RLS) |
| **Encryption** | expo-crypto (SHA-256) + libsodium (XChaCha20-Poly1305) |
| **Biometric** | expo-local-authentication (Face ID / fingerprint) |
| **Media** | expo-camera, expo-av, expo-image-picker |
| **Storage** | expo-secure-store (encryption keys) |
| **AI** | Claude API (via Supabase Edge Functions) |
| **Payments** | RevenueCat + Apple App Store + Google Play |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

MIT. See [LICENSE](LICENSE).

---

## Support

Email: hvacandroof@gmail.com
