# Changelog

All notable changes to EvidenceVault are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-06-23

### Added

- **MVP Release** — All Phase 0–3 features complete
- Authentication: Email/password + Supabase Auth
- Incident Journal: Create, edit, organize incidents with emotional context
- Evidence Vault: Encrypted storage of photos, videos, audio, documents
- Encryption & Integrity: XChaCha20-Poly1305 + SHA-256 hashing
- Biometric App Lock: Face ID / fingerprint unlock
- Timeline View: Chronological view of incidents, evidence, reports
- Witnesses & Reports: Record police reports, medical records, witness statements
- PDF Export: Generate court-ready case-file PDFs with integrity audit trail
- Panic Button: Quick-tap alert to trusted contacts (SMS + check-in)
- Check-in Reminders: Scheduled safety check-ins with escalation on miss
- AI Assistant: Incident summaries, keyword search, report drafting (Claude API)
- Subscriptions: Freemium model via RevenueCat (50 MB free; premium: unlimited)

### Security

- All evidence files encrypted before upload (E2E)
- Row-level security on all database tables
- Integrity log for chain-of-custody
- No analytics or telemetry on user content

### Known Issues

- Biometric unlock and IAP only work in dev builds, not Expo Go
- RevenueCat webhook requires manual configuration
- Anthropic API key must be set as Supabase Edge Function secret

---

## [Unreleased]

### Planned

- [ ] Full E2E encryption (Argon2id key derivation)
- [ ] TLS certificate pinning
- [ ] Cryptographic signature for Integrity Reports
- [ ] Continuous biometric authentication
- [ ] Whistleblower mode (anonymous incident recording)
- [ ] Twilio integration for automated panic SMS
- [ ] Server-side scheduled check-in reminders
- [ ] Annual subscription product
- [ ] Offline mode improvements
- [ ] Dark mode enhancements
- [ ] Internationalization (i18n) — Spanish, French, etc.
- [ ] Android tablet UI optimization
- [ ] Web version (read-only)

---

## Release Notes

### How to upgrade

1. Update to the latest version via the App Store or Google Play
2. Data is automatically migrated (no action required)
3. New features unlock based on your subscription tier

### Reporting bugs

Please open a GitHub issue with:
- Steps to reproduce
- Expected vs actual behavior
- Device/OS info
- Error logs (if any)

**Do not include incident data or personal information in bug reports.**

---

## Versioning Policy

- **MAJOR (x.0.0)**: Breaking changes or major new features
- **MINOR (0.x.0)**: New features, non-breaking
- **PATCH (0.0.x)**: Bug fixes and security patches

We aim to release bug fixes and patches within 1-2 weeks and new features every 4-6 weeks.
