# Contributing to EvidenceVault

Thank you for your interest in contributing to EvidenceVault! This project is built with the security and privacy of users in mind, so we follow strict guidelines for code quality, testing, and review.

---

## Code of Conduct

Be respectful, inclusive, and constructive. Harassment or discrimination is not tolerated.

---

## Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR_USERNAME/evidencevault.git
cd evidencevault
npm install
```

### 2. Create a feature branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch names should be descriptive and lowercase:
- `feature/*` for new features
- `fix/*` for bug fixes
- `docs/*` for documentation
- `chore/*` for maintenance

### 3. Set up environment

Copy `.env.example` to `.env.local` and fill in test credentials:

```bash
cp .env.example .env.local
```

For local testing, you can use a free Supabase project or the public demo keys.

---

## Development Guidelines

### Code Style

- **TypeScript:** Strict mode enabled. No `any` types without justification.
- **Naming:** camelCase for variables/functions, PascalCase for components/classes.
- **Comments:** Only add comments for *why*, not *what*. The code should be self-explanatory.
- **Imports:** Organize as: React → external libs → local utils → styles.

### Example

```typescript
// ❌ Poor
const x = 5;  // number of files

// ✅ Good
const maxFileSizeBytes = 5 * 1024 * 1024;
```

### Formatting

```bash
npm run format
```

This runs Prettier. Format before committing.

### Linting

```bash
npm run lint
```

Fix issues:

```bash
npm run lint:fix
```

### Type Checking

```bash
npm run typecheck
```

All code must pass `tsc` with no errors. No warnings.

---

## Testing

### Unit & Integration Tests

```bash
npm test
# or for watch mode
npm test:watch
```

**Guidelines:**
- Write tests for new features and bug fixes.
- Aim for >80% coverage on critical paths (auth, encryption, payment flows).
- Use descriptive test names: `should throw error when password is too short`.
- Test both happy path and error cases.

### Manual Testing

For features that can't be fully automated (biometric lock, camera, IAP):

1. Build a dev APK/IPA:
   ```bash
   eas build --profile development --platform ios
   ```
2. Install on a real device or simulator.
3. Test the feature end-to-end.
4. Document your test steps in the PR.

### Security Testing

If you're touching encryption, storage, or authentication:

1. Run the security linter:
   ```bash
   npm run security:audit
   ```
2. Review [ARCHITECTURE.md](ARCHITECTURE.md) for threat models.
3. Get sign-off from the maintainers before merging.

---

## Commit Messages

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat` — new feature
- `fix` — bug fix
- `docs` — documentation only
- `style` — formatting (no logic change)
- `refactor` — code reorganization (no logic change)
- `test` — tests only
- `chore` — tooling, deps, CI
- `security` — security fix or hardening

**Examples:**

```
feat(vault): add encryption key rotation

Implement rotating XChaCha20 keys monthly. Keys are derived from passphrase + salt.

Fixes #123
```

```
fix(auth): prevent session fixation on re-login
```

```
docs: update privacy policy in README
```

---

## Pull Request Workflow

### Before you submit

1. **Rebase on `main`:**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run checks locally:**
   ```bash
   npm run typecheck
   npm run lint
   npm test
   ```

3. **Test manually** (if relevant):
   - Start dev server: `npm start`
   - Test the feature in Expo Go or a dev build
   - Test on both iOS and Android if possible

### Submit the PR

- **Title:** match the first commit message
- **Description:** explain *why*, not just *what*. Link related issues.
- **Test plan:** describe how you tested it
- **Screenshots/videos:** for UI changes

**Template:**

```markdown
## Summary
Brief description of the change.

## Motivation
Why is this change needed? What problem does it solve?

## Changes
- Added X
- Modified Y
- Removed Z

## Test Plan
- [ ] Feature works in Expo Go on iOS
- [ ] Feature works in Expo Go on Android
- [ ] Type checking passes
- [ ] Tests pass
- [ ] Manual test: [describe steps]

## Related Issues
Fixes #123
Relates to #456
```

### After submission

- **Respond to feedback** within 48 hours if possible.
- **Push updates** to the same branch; the PR updates automatically.
- **Don't force-push** after review starts (makes it hard to track changes).
- **Maintainers will merge** when approved.

---

## Areas of Focus

### High-priority contributions

We especially welcome PRs in these areas:

- **Security hardening:** encryption, key management, RLS improvements
- **Testing:** expanding test coverage, edge cases
- **Performance:** reducing bundle size, faster encryption, query optimization
- **Accessibility:** larger tap targets, better contrast, screen reader support
- **Internationalization:** translations, locale handling

### Don't contribute

- Large refactors without discussion (open an issue first)
- New dependencies without justification (keep the project lightweight)
- Changing the privacy policy or security design without maintainer agreement

---

## Documentation

If you add a feature, update the relevant docs:

- **New hook?** Add JSDoc comments.
- **New page/screen?** Update `ARCHITECTURE.md` with the route.
- **New API endpoint?** Document in code comments or a separate guide.
- **Breaking change?** Update `README.md` and `CHANGELOG.md`.

---

## Troubleshooting

### "TypeScript errors after pulling"

```bash
npm install
npm run typecheck
```

### "Expo types are out of sync"

```bash
rm -rf .expo/
npm start    # regenerates .expo/types/router.d.ts
```

### "RevenueCat or Supabase tests fail"

Some tests require credentials. They're skipped in CI; run locally with valid `.env.local`:

```bash
npm test -- --testNamePattern="RevenueCat"
```

---

## Getting Help

- **Discord/Slack:** [link to community]
- **Issues:** Open a GitHub issue for bugs or feature requests
- **Email:** hvacandroof@gmail.com (for security issues, use GitHub private disclosure)

---

## Thank you!

Your contributions make EvidenceVault safer and better for everyone. 💙
