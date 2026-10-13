# Smart UPI V18.1 acceptance report

Verified on 14 October 2026 IST. This report distinguishes implementation checks from actual provider acceptance.

## Executed checks

- **359/359 repository tests passed**, including 19 dedicated Smart UPI tests. Existing billing, closing, document, authentication, permissions and VoiceOS tests passed.
- **Typecheck, lint and production build passed.** The production build ran in an isolated checkout so the existing port-3000 preview and real shop database were not disturbed.
- **English, Hindi and Hinglish compiled-browser workflows passed.** These exercised QR upload; camera denial/recovery and actual QR decoding from synthetic video frames; explicit destination confirmation; saved status without a false tracking claim; the official OAuth redirect and server exchange through a fixture; signed provider observations; repeat-payer linking; unchanged balances on customer linking; confirmed invoice payment; matching an existing manual receipt without double posting; exact provider-QR invoice allocation; unverified statement import; CSV download; typed VoiceOS queries; private avatar storage; account-name refresh after saving; and disconnection.
- **24 responsive layouts passed:** profile and payment centre, three languages, widths 320/390/768/1440 pixels. No horizontal document overflow.
- **Six scoped WCAG 2 A/AA axe scans passed with zero detected violations**, one per page/language at 390 pixels. This is automated coverage, not a claim of complete accessibility certification.
- Final screenshots were visually inspected on desktop and mobile. Profile category labels, readable CTA text and muted-text contrast were repaired after inspection. The browser assertions now check the real translated category and reject translation fallback text.

Dedicated tests cover tenant/role isolation, HTTP action routing and method rejection, single-use OAuth state, encrypted private tokens, signed and rotated-secret validation, duplicate/out-of-order events, stable payer references without inferred names, allocation idempotency, manual-receipt matching, advances, partial refund reversal, unverified CSV imports, timezone/date validation, private images/session cleanup, branding primary consistency, test-money exclusion, retained test-to-live authorisation labels and all approved natural UPI queries.

## Fixtures and evidence

The browser suite launches a **compiled Next production server** against a new `upi18-production-qa-*` SQLite database. Fictional credentials and the guarded process-only fixture intercept official Razorpay token/payment/QR endpoints. Signed webhook requests still pass through the real server, validators, database services and ledger. Camera QR decoding uses real canvas video frames with synthetic media. VoiceOS input is typed; recognition and synthesis are explicitly simulated. No live bank transactions, human microphone quality or physical-camera acceptance are represented by these results.

The fixture starts with a ₹200 unpaid bill and a previously recorded ₹30 UPI receipt. It then observes ₹90 and ₹30 captured payments and a fully refunded ₹10 payment. Linking a payer changes no financial totals. Allocating ₹90 leaves ₹80 due; matching the existing ₹30 does not create another receipt. An authoritative mapped ₹80 QR receipt closes the remaining balance. An imported ₹25 receipt stays unverified and does not increase the verified ₹200 collection. All values are fictional QA inputs, never application constants.

Files:

- `production-report.json`: final executed browser results and limitations.
- `smart-upi-tests.txt`: dedicated test output.
- `production-build.txt`: compiled build output.
- `profile-*-390.png`, `centre-*-390.png`, `centre-*-1440.png`, `voice-query-*.png`: final fictional-fixture screenshots.
- `scripts/qa/upi18-production-review.mjs`, `upi18-provider-fixture.mjs`, `upi18-seed.ts`: reproducible acceptance harness.

The QR endpoint originally returned 404 because the legacy router allowed UUID records but not named UPI operations. A dedicated match now accepts UPI operations while retaining business membership checks, UUID-scoped records and method rejection; a HTTP regression test covers it. Test-harness OAuth navigation and hydration waits were also corrected so checks run against the rendered destination page.

## Required external acceptance before release

No Razorpay partner client credentials or authorised test/live merchant were configured in the workspace. The selected official adapter is implemented; actual provider acceptance is **pending**. Before feature → dev → main release:

1. Register an approved Technology Partner application, exact HTTPS callback and signed webhook URL. Use server-side secrets from `.env.example`; confirm merchant KYC, OAuth scopes and optional QR entitlement.
2. Authorise a real approved sandbox/test merchant in an isolated test shop. Confirm payment history, capture/failure events, partial/full refunds, duplicate/retried webhooks, token refresh, revocation from both DukaanSet and the provider dashboard, and the difference between unsupported QR receipts and provider-owned receipts.
3. Verify exact dynamic-QR mapping, expiry and uncertain-creation recovery under genuine provider responses. Confirm unavailable capabilities remain truthful.
4. Test camera permission/QR scanning on physical Android and desktop, and actual microphone/TTS quality for the approved UPI questions in all three languages.
5. Run a controlled live-merchant acceptance after sandbox sign-off, verifying destination, receipt, existing-payment matching and bank/provider reconciliation. Test mode must remain unable to post to a real ledger.

Settlement reporting, direct refund initiation, universal bank history and subscription billing are not implemented. They are disclosed as unsupported/unavailable. No production deployment is authorised by these fixture results.
