# V5 multilingual implementation and verification

Date: 9 October 2026. Local environment: Windows, Node 24, Next 16.4, headless Edge. Tests use fictional in-memory data or the isolated port-3001 test database/outbox. The merchant's port-3000 database was not reset or uploaded.

## Completed verification

- `npm run test:locales`: 1,543 entries per locale; 100% key/interpolation parity; zero detected raw JSX interface text. Injected duplicate, missing-key, script and hardcoded-copy defects correctly fail the gate.
- `npm run lint`: syntax, localization, literal fallback and no-debugger rules passed for 102 source files; the service worker parses successfully.
- `npm test`: **125 passed, 0 failed**, including nine localization tests. Covers request-engine isolation, missing-key behavior, localized structured errors with exact source names/values, Latin India formatting, counted units, reviewed product names/invoice snapshots, tenant boundaries, provider-language rejection, full-ledger financial templates without external calls, localized one-use emails and read-only communication previews.
- `npm run typecheck`: passed.
- Production build: passed; public/auth/private locale-aware routes compile and public sitemap/robots output generates.
- New localization browser suite: **9 passed, 0 failed**. All 57 public locale routes returned the right server-rendered script tag and alternates. Public screens were checked at 320/360/390/768/1440px, with no overflow and zero Axe violations in the public main region. Nine private modules rendered their selected-language headings in each locale.
- Each locale saved a real split credit sale: ₹1,250 total, ₹450 cash + ₹300 manually recorded UPI, ₹500 remaining, one invoice and one stock deduction. Invoice source names remained unchanged. Actual downloads begin with `%PDF-`; captured rendered PDF text includes localized labels, original names and exact amounts. Hindi and Roman Hinglish PDF images were visually reviewed for shaping/clipping.
- Mid-draft language changes preserved quantity, receipt and discount fields; payment and DemandPulse sheets stayed open with their values. A rejected overpayment error re-rendered in Hindi. Voice transcript and reviewed rows stayed intact; no invoice, payment, demand or stock entry was created by the language switches.
- Mocked live capture retained its Hindi recognition language and transcript when display language changed. A stale English AI response was discarded while preserving the question; the next recorded-data response used Hindi. A customer reminder retained its independently chosen communication locale. Registered preference survived logout, fresh-device login with an English cookie and business switching.

## Regression status

Product/onboarding/tenant/transaction browser suite: 7 passed. V2 customer/statements/insights: 2 passed. V2 sales/photo/recovery: 9 passed on re-run. The initial sales run had one outdated assertion expecting `4 piece`; the corrected interface intentionally displays `4 pieces`. No stock/ledger logic changed for that assertion.

V2 voice inventory: 6 passed. V3 DemandPulse/auth/configuration: 8 passed. Voice product creation: 3 passed. VoiceOS: 8 passed. Across all eight suites, **52 unique browser scenarios passed**; suites use separate fresh servers and the corrected sales suite and final localization suite were re-run. The final localization run also verified client navigation from an English public page into the saved Roman Hinglish login interface.

The isolated local production server passed **7/7 smoke checks**, including security headers, private-route denial, manifest/icons, service-worker control, public-only cache contents and offline navigation in all three locales. Offline APIs remained unavailable and no business records entered Cache Storage. The temporary server was stopped. [Sanitized production smoke report](qa/v5/production-smoke.json).

## Evidence and scope

Screenshots use fictional data: [Hindi phone viewport](qa/v5/public-hi-390-viewport.png), [English phone viewport](qa/v5/public-en-390-viewport.png), [Roman Hinglish phone viewport](qa/v5/public-hinglish-390-viewport.png), [Hindi invoice](qa/v5/invoice-hi-1440.png), [Hindi rendered PDF](qa/v5/pdf-hi.png), [Roman Hinglish rendered PDF](qa/v5/pdf-hinglish.png). Full-page variants are in `docs/qa/v5`.

Script/parity checks do not certify natural-language quality or every possible dynamic string. Mocked browser capture verifies application event handling, not physical accent/noise recognition. Raster PDF text is shaped correctly but is not searchable. Physical Android/desktop speech, screen-reader review, live HTTPS installation and configured-provider linguistic acceptance remain unverified.

Hosted staging still requires its isolated persistent backend/volume, deployment check token and verified mail sender. The staging smoke now includes all three public locales, saved private preferences, VoiceOS/DemandPulse routes and PDF downloads, but cannot run against a successful stable hosted deployment until those dependencies exist. This delivery does not claim production deployment or live email/model acceptance. Production releases still require reviewed promotion; main/staging/production remain at their existing baseline.
