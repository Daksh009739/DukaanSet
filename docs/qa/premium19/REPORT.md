# Voice auto-send, premium details and merchant QR verification

Verified on **18 October 2026 (Asia/Kolkata)** with isolated databases and fictional QA businesses. The local merchant database was not used for test writes.

## Changes

- Native recognition no longer waits indefinitely for an omitted speech-end event. Changed transcripts keep a turn alive; duplicate/stalled events do not. The bounded stop/finalization path submits one final utterance and releases native recognition. Interim text, errors and cancellation cannot create a transaction.
- Customer, bill, stock, purchase, supplier and payment details share a premium header, metric hierarchy, tabs, disclosures, typography and responsive actions. Shared inner dialogs have consistent form fields, errors, hover and focus treatments. Motion respects reduced-motion preferences.
- Login, registration and recovery retain their existing security and validation while receiving the new brand layout and form treatment. The voice demo text is correctly localised and optional on login.
- An uploaded and confirmed UPI destination appears on the dashboard with its payee, complete UPI ID, scannable QR, copy/download controls and existing management link. The QR is regenerated from the exact saved destination; no amount/reference is invented. QR display is separate from verified collections.
- The generic hover rule no longer inverts primary/destructive button colours, correcting the previously reported remote PDF-dialog contrast failure.

## Verification

Final counts and per-suite timestamps are recorded in [results.json](results.json).

- **434 backend tests passed**, including new missing-speech-end, late final, repeated event, cancellation, network error and native-release cases.
- **49 browser tests passed across 10 focused suites**, with no failures, skips or flaky cases. Nine suites use the compiled app; the public/auth fixture suite uses development mode.
- The voice browser case sends the ₹100 bill draft automatically without native speech-end or end callbacks; no bill exists before a separate confirmation, and exactly one bill exists afterward. Existing duplicate-customer, pause/resume, permission-denial, encoding, retry and stock confirmation checks pass.
- The UI matrix checks English, Hindi and Hinglish at 320, 390, 768 and 1440 px: **132 layouts and 33 scoped axe scans**, with no overflow or reported violations. It exercises actual QR image upload, reviewed destination save, dashboard display/download, seven inner record types, login, registration and recovery. Reading these views preserves invoices, payments, purchases, product quantities and stock movements.
- Regression suites also cover Invoice Studio, closing/insight dialogs, account navigation, workspace overlays, public/auth workflows, the header and approved Dashboard. PDF dialogs retain private downloads, A4/thermal output and financial integrity.
- TypeScript, source lint, **3,292 translation keys per language** and isolated production build pass.

## Previews

These previews use labelled sample/fictional records. The QR is a fictional test destination and must not be used for payments.

- [Login desktop](login-en-1440.png) · [login phone](login-en-390.png)
- [Registration desktop](register-en-1440.png)
- [Customer details](detail-0-en-1440.png) · [Hindi bill on a phone](detail-4-hi-390.png)
- [Saved UPI display fixture](qr-en.png)

## Limits

Native browser speech/TTS events are simulated; encoded microphone coverage uses synthetic audio. The tests establish endpointing, auto-send, lifecycle cleanup and application behaviour, not real-world acoustic accuracy. A human desktop/Android microphone run, noisy-room behaviour and provider speech quality remain device acceptance checks.

The saved QR does not verify a bank account, a QR scan or a payment. Existing authorised-provider configuration and verification remain required for automatic payment tracking. No live payment, external customer communication, production deployment or merge is part of this work.

## Reproduction

Use Node 24 and an isolated checkout/database. Run the repository Node tests, source lint, locale checker and TypeScript check, then build before starting compiled browser acceptance:

```text
npm test
npm run lint
npm run test:locales
node node_modules/typescript/bin/tsc --noEmit
npm run build
node scripts/qa/application18-production-review.mjs premium-details-v19.spec.ts voice31.spec.ts voice33.spec.ts pdf-suite.spec.ts invoice-studio.spec.ts insight-workspaces.spec.ts workspace-overlays.spec.ts premium-website.spec.ts application-header.spec.ts approved-dashboard.spec.ts
```

The runner creates fresh fixture databases. Only the public/auth suite uses development mode for the existing private file-mail fixture; the other listed suites use the compiled app. Do not build while a compiled test server is using the same checkout.
