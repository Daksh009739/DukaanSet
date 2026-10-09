# DukaanSet V2 verification

Verified locally on 9 October 2026, Windows, Node.js 24 and headless Microsoft Edge. This report covers the connected V2 source on `dev`; [V1 results](test-report.md) remain historical evidence. Test records and screenshots are fictional. No live deployment or commercial readiness is claimed.

## Results

| Check | Command | Result |
| --- | --- | --- |
| Backend, browser helpers and voice | `npm test` | **58 passed**, zero failures |
| Complete browser regression | `npm run test:e2e`, with affected-suite reruns | **24 passed** across four suites, zero unresolved failures |
| Production bundle and TypeScript | `npm run build` | Passed, exit 0; **28 static pages**, dynamic API/workspace routes |
| Local production smoke | `npm run test:production -- http://127.0.0.1:3002` | **7 checks passed**, zero failures |
| Private database snapshot | `npm run backup` | Snapshot created; SQLite integrity and foreign keys verified |
| PDF rendering | App downloads opened with pdf-lib, rendered with Poppler and visually inspected | English/Hindi invoice and customer statement are real PDFs; inspected Hindi/statement pages have readable text and aligned amounts |

The browser runner uses one fresh managed development server per spec. This keeps speech mocks and process-local demo throttles separate without relaxing production request limits. The four suites passed **7 existing product cases, 2 customer/business cases, 9 sales cases and 6 voice cases**. The final sales rerun took 1.4 minutes and voice 1.1 minutes. An added logout recovery test initially omitted selecting its original business after logout cleared the remembered selection; that test was corrected and the affected sales suite passed. Reports remain under ignored `playwright-report/<suite>/`, screenshots/traces under `test-results/<suite>/`, and the most recent command summary under `.local/e2e-summary.json`.

Production smoke used a separate `.data/production-check-v2.sqlite` database and verified public rendering, security headers, manifest/icons, anonymous private-route redirection, service-worker control, public-only caches and offline fallback. Private records/API responses never entered that cache. Authenticated HTTPS production operation and real PWA installation are separate pending checks.

## Core acceptance scenario

The Fashion demo starts with four Blue Casual Shirts at ₹899 and Rahul Sharma with no earlier balance. The app selects two shirts, attaches an optional fictional photo, chooses Rahul and records ₹1,000 cash plus ₹500 manual UPI. One Save Sale creates:

| Record | Verified value |
| --- | --- |
| Invoice total | ₹1,798 |
| Received | ₹1,500: cash ₹1,000 + UPI ₹500 |
| Customer outstanding | ₹298 |
| Remaining shirts | 2 pieces |
| Item history | Original ₹899 price, variation and protected photo snapshot |

Customer profile, invoice, stock, dashboard collections and dues all use those same server records. Replaying the request returns the same invoice with no second deduction or receipt. Editing the product to ₹999 later preserves the original invoice price. Full cancellation returns stock and appends refunds by original method; later repayments prevent cancellation until a reviewed adjustment flow exists.

## Browser coverage

- Existing public pages, phone navigation, registration, protected routes, business/language switching, billing, repayment persistence, purchases, expense/closing, cancellation, tenant denial and matching-Origin protection remain covered.
- New Sale covers product search, aliases/barcodes, whole-piece and decimal quantities, optional photo upload/retry/remove, quick customer creation, draft preservation, cash/UPI/credit/split and overpayment rejection. Invoice history uses real customer/date/status filters and item snapshots. PDF downloads have a `%PDF` signature and valid page structure.
- A deliberately lost committed sale acknowledgement freezes the original request, photos and retry key. Reload with only one shirt left still recovers the original three-shirt sale. Logout cleanup preserves the recovery key while clearing unrelated storage; that browser exercise mocks only the logout acknowledgement to retain its isolated demo session. Real server logout invalidation is verified separately in API tests.
- Corrupt photo metadata cannot make foreign or cross-business image requests. Malformed recovery JSON blocks a replacement sale. Denied browser storage prevents both sale and quick-customer POSTs. Lost customer acknowledgement replays the exact original request and returns one customer identity.
- Customer 360 shows complete-ledger sales, signed payments and due; statement downloads fetch a single authoritative server snapshot. Product editing and formula-safe stock CSV export are connected.
- Voice tests cover editable multi-product review, ambiguous dal selection, aliases, correction/removal, missing follow-up, manual additions, offline blocking, scoped refresh recovery, history repeat without automatic save, duplicate retry, foreign IDs, shared demo reset and a lost save acknowledgement.
- Speech recognition is mocked to verify deliberate Start/Stop, interim/final deduplication, unsupported browsers and permission denial. Typed samples are explicitly simulated. These tests do **not** measure physical microphone quality or speech-vendor accuracy.

## Layout, language and accessibility

Sales is checked at **320, 360, 375, 390, 412, 430, 768 and 1440px**. Voice and customer/business screens include **320, 390, 768 and 1440px** checks. English, Hindi and Hinglish app display and document language switching are exercised. Recorded product/customer names retain their original text.

Scoped axe checks cover the affected workspace screens. Phone checks assert no horizontal page overflow; fixed sale actions and voice Stop remain above bottom navigation. Low-contrast voice captions were corrected, and sales toasts were moved above the mobile action bar. This is bounded automated and visual evidence, not a full WCAG certification, screen-reader audit or physical-device test.

Invoice and statement files use locally rendered Unicode fonts and paginated A4 pages. Text is rasterized for Hindi shaping and is not searchable. Native file sharing is implemented as prepare-file then explicit share; actual operating-system share sheets are not exercised by headless tests. Camera/gallery tests use a generated image fixture, not a physical phone camera.

## Data preservation and boundaries

Migration tests start with a V1 database and verify account/session/product/customer/invoice/payment/audit preservation across the additive V2 migration and reopen. The actual local app's existing account and three-shop demo were also read after migration. No merchant database was deleted. Demo reset only touches the authenticated exclusive demo, retains its identities/language and adds Fashion to an older demo; a shared-business failure rolls back the transaction.

Photos are authenticated private SQLite blobs, fully decoded/re-encoded with metadata removal and bounded size/pixels/quota. Saved attachments are immutable and remain outside public caches. API checks cover authentication, membership, CSRF, rollback, integer arithmetic, closing, replay conflicts, attachment ownership, corrupted uploads and all-ledger totals beyond recent-history caps.

The local backup is a verified current **V2** snapshot made after migration, stored in ignored `.data/backups/`; it is not a pre-upgrade backup or an automatic backup service. GitHub stores source/docs/assets, not private financial data. A full stopped-app restore drill remains operational work.

## Remaining work

The core local sales and reviewed voice-inventory paths are implemented. Browser speech depends on supported devices and may use the vendor's servers. The parser and business summary use deterministic rules; no hosted transcription or LLM adapter is active. Raw audio/transcript text is not stored by the backend.

Real Android microphone/noise/accent testing, HTTPS PWA installation, native sharing/camera verification and merchant usability trials remain. Owner-only accounts, local SQLite and manual UPI recording are the current operating boundaries. Staff roles, account recovery, PostgreSQL/multi-process operation, supplier repayments, partial returns/exchanges, batch-expiry/variant matrices, CSV import, offline financial synchronization, OCR, automated messaging, provider-confirmed payments and subscriptions remain future work. See [implementation/status](v2-implementation.md) and [voice field checklist](v2-voice.md).

## Rendered evidence

Durable fictional UI captures are stored in [docs/qa/v2](qa/v2/). The listening screenshot uses a mock recognizer and is labelled accordingly. Generated PDFs and their read-only render QA remain ignored local artifacts.

| Screen | Capture |
| --- | --- |
| Home, desktop | [dashboard](qa/v2/dashboard-desktop.png) |
| Home, phone | [dashboard](qa/v2/dashboard-mobile.png) |
| New Sale, phone | [390px](qa/v2/new-sale-390-viewport.png) |
| Fashion receipt, phone | [invoice](qa/v2/fashion-invoice-mobile.png) |
| Lost response recovery, phone | [locked retry](qa/v2/lost-response-recovery-mobile.png) |
| Voice, English phone | [entry](qa/v2/voice-phone-en.png) · [review](qa/v2/voice-phone-en-review.png) |
| Voice, Hindi phone | [entry](qa/v2/voice-phone-hi.png) · [review](qa/v2/voice-phone-hi-review.png) |
| Voice, Hindi desktop | [entry](qa/v2/voice-desktop-hi.png) |
| Explicitly mocked listening | [visible Stop](qa/v2/voice-listening-ui-mock-en.png) |
| Rules-based business summary | [saved records](qa/v2/v2-insights.png) |
