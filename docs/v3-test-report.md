# DukaanSet V3 verification

9 October 2026. Verification used Windows, Node 24, the committed Next/React dependencies, isolated SQLite databases and headless Microsoft Edge. V3 extends baseline `d864fa2`; the 58 existing unit/client/voice checks passed before implementation. Test accounts, invoice photos and workflow fixtures are fictional.

## Final results

| Check | Result | Evidence/scope |
| --- | --- | --- |
| `npm run typecheck` | Passed | Final permissions/components/services compile without TypeScript errors. |
| `npm test` | **88 passed, 0 failed** | Existing 58 plus 30 V3 auth, demand, permission, CSV, voice and AI tests. |
| `npm run test:e2e` | **32 passed, 0 failed** | Product 7, V2 business 2, V2 sales 9, V2 voice 6, V3 8; [suite exit summary](qa/v3/browser-suite.json). |
| Enhanced final role scenario | **1 passed** | After final invoice-read/action UI gating, reran the owner-invites-staff case with custom sales/payment denial and customer/invoice read checks. This is a rerun of one scenario, not an extra distinct test. |
| `npm run build` | Passed | Optimized bundle compiled, TypeScript passed and 30 static pages generated. |
| Production smoke on port 3002 | **7 passed, 0 failed** | [Sanitized JSON](qa/v3/production-smoke.json): public page, headers, real icons/manifest, anonymous redirect, SW control, public-only cache and offline fallback. |
| Pre-V3 snapshot migration/reopen | Passed | [Snapshot evidence](qa/v3/migration-verification.json), additive schema 2→3, integrity `ok`, 0 FK errors, original values preserved. |
| Actual local database upgrade/reopen | Passed | [Local evidence](qa/v3/local-migration.json), original columns/values in 17 existing tables unchanged. |

The complete browser suite passed before the final custom-role UI refinement; the enhanced affected browser scenario, TypeScript, unit suite and production build then passed against that final source. No broad regression rerun is claimed after unrelated documentation edits.

## V3 workflow evidence

- Record unavailable XL shirt demand with explicit quantity, customer and consent from stock; create an editable reorder draft; confirm actual goods receipt; prepare a message without falsely marking contact; record contact manually; create an ordinary saved sale; explicitly link invoice units; verify customer demand history and persistence after reload.
- Parse uncatalogued speech containing three visitors without inventing a three-unit quantity; require explicit requested units before save; anonymous requests cannot give follow-up consent or create recovered revenue.
- Commit a demand write and abort its acknowledgement; reload, freeze edits and retry the unchanged stored body/key; confirm only one request exists.
- Disable a module, verify its navigation and direct API write denial, retain historical data and re-enable it.
- Register, consume the private verification link, set up an empty real shop, choose optional first product, reset password through an actual one-use link and verify old-session revocation/new login.
- Review quoted CSV names, confirm opening inventory without sales, preserve existing products and refuse duplicate SKUs. Unit tests additionally prove every row rolls back on collision.
- Invite a real registered test account, accept with that recipient, verify staff cost/report/team/export/stock-write restrictions, then override sales/payments off while retaining customer/invoice read access. Sale/payment/cancellation controls stay hidden and direct cancellation is refused. Remove membership and verify immediate state denial.
- Exercise all three languages at widths **320, 390, 768 and 1440px** for Demand, feature settings, account and New Sale. Assert no document horizontal overflow. Automated axe WCAG checks found no violations in the tested Demand workspace and capture dialog. These checks do not certify the entire application or replace screen-reader/device testing.

V2 regression browsers retained sales/split credit/cancellation/signed refund/closing, ordinary photos/PDFs, customer statements, purchases, product edits, draft recovery, privacy/tenant/CSRF and reviewed voice failure/correction workflows. Voice microphone events and unavailable-provider behavior are controlled test mocks; no physical microphone accuracy is claimed.

## Server and migration evidence

V3 tests verify hashed token storage, explicit verification, expiry/reissue/one-use reset, session revocation, intended-recipient invitation, inviter authority/removal, legacy unverified truth, production file-delivery refusal and private-outbox path refusal. Resend and OpenAI calls are mocked, including failure/incomplete responses. No external email, customer message or paid AI request was sent by these tests.

Demand assertions cover no financial/stock mutation on capture, tenant rejection, product/variant/unit matching, separate visitor counts, supplier receipt rollback/duplicate protection, draft cancellation, consent/history, maximum invoice/request units, matching customer/date, proportional net discount allocation, no duplicate unit attribution and cancellation reversal. Configuration/permission checks exercise server writes, filtered state and purchase-cost redaction. AI request tests inspect tenant scoping, phone/email/token omission and read-only totals/stock. Parser tests refuse negative/overprecision quantities. Dictionary keys exist in all three languages.

A SQLite-consistent pre-V3 backup was made before opening V3 on merchant storage. Snapshot and actual local migration checks hash all original columns/rows in `users`, `businesses`, `memberships`, `sessions`, `products`, `customers`, `suppliers`, `invoices`, `payments`, `movements`, `inventory_entries`, `purchases`, `expenses`, `closings`, `audit`, `idempotency` and `attachments`, then compare after migration and reopen. All remained unchanged. Only sanitized table counts/results are tracked; private data, hashes of private row contents, raw tokens, sessions and database files are excluded.

## Rendered review

The Demand desktop and phone views were inspected after spacing/layout refinements, as was the capture sheet. Files contain fictional demo records.

| Language | Desktop | Phone |
| --- | --- | --- |
| English | [Screenshot](qa/v3/demand-en-desktop.png) | [Screenshot](qa/v3/demand-en-phone.png) |
| Hindi | [Screenshot](qa/v3/demand-hi-desktop.png) | [Screenshot](qa/v3/demand-hi-phone.png) |
| Hinglish | [Screenshot](qa/v3/demand-hinglish-desktop.png) | [Screenshot](qa/v3/demand-hinglish-phone.png) |

[Phone capture sheet](qa/v3/demand-capture-phone.png). Full-page captures include a viewport-fixed mobile navigation/sheet over a longer page; the capture sheet scrolls independently. Development screenshots include the Next development indicator, absent from the production build. Existing [V2 evidence](v2-test-report.md) is preserved separately.

## Operating and verification limits

The local preview runs at [http://127.0.0.1:3000](http://127.0.0.1:3000) using the preserved upgraded database. The production smoke process used a different QA database and was stopped after verification. E2E uses port 3001, `.data/e2e.sqlite`, a private test mail outbox and `.next-e2e`. No real business was reset or seeded.

No live HTTPS ingress/domain, real email sender/delivery, paid model accuracy, physical Android/iOS mic/PWA installation, screen reader, merchant acceptance, real external sharing, print device, performance/Core Web Vitals or public traffic/concurrency test is claimed. Recovery provider timing is not normalized; throttles are process-local. Backup is an explicit command, not an automated service. Browser storage recovery is same-tab retry support, not offline sync.

SQLite single-process operation, cash-only supplier payments, oldest-first customer repayments and full-cancellation restrictions remain. PostgreSQL, partial returns, batch expiry, full variant matrices, supplier repayment, subscriptions, settlement verification, OCR/hosted STT, offline financial synchronization and nearby merchant networking remain future phases. [Implementation and completion limits](v3-implementation.md) and [deployment preparation](deployment.md) give the operational handover.
