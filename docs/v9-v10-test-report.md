# V9 dashboard and V10.1 daily closing

Implementation and local verification: 10 October 2026. V10.1 takes precedence over V10; all three source briefs are preserved in `docs/briefs/`.

## Delivered behavior

Home has one four-metric summary, a prominent session/closing card, contextual quick actions, prioritized work, recent bills and recent activity. Customer detail uses keyboard-accessible Activity, Bills and Hisaab tabs. Product, received purchase, supplier, payment and purchase-order pages show scoped records. Complete histories use server pagination rather than dashboard limits. Existing invoice, statement, voice, stock, DemandPulse and WhatsApp review flows remain available.

Closing reads the complete saved ledger. Opening review or applying voice input never closes the session. Confirmation freezes a snapshot without creating sales, payments, expenses or stock movements. Cash counting can be skipped where allowed. Shortages/excesses require acknowledgement and do not automatically create expenses. UPI never enters the physical drawer calculation.

Owners configure timezone, cutoff, closing time, optional counting, notices and explicit manager grants. Automatic closing is off by default. A persistent backend worker uses durable SQLite jobs, retries and owner notices. Automatic reports always leave physical cash pending. Both scheduled and actual completion times are recorded; late execution snapshots the records actually observed without backdating a fictitious result.

Cash verification creates a new immutable report version with reason, source references and revision actor, retaining the original closer/time. A late transaction is recorded once in an explicitly opened session, then its verified ID can be linked to an earlier report. Linking never inserts a second ledger entry or rewrites original totals. Old cash-only closing records remain visible and clearly identified.

## Accounting policy

- All money uses safe integer paise with overflow rejection; quantities use thousandths.
- Net sales are issued sales less dated cancellations/returns. Collections are positive receipts, with refunds separate. Older dues recovery does not create sales.
- New credit is original issued credit, independent of later repayment. Receivables use dated invoice, reversal and signed payment events.
- Expected cash = confirmed opening float + cash receipts − cash expenses − cash supplier payments − cash refunds + deposits − withdrawals. Noncash amounts remain separate.
- Initial legacy purchase payments are cash; new supplier payments record their method and atomically reduce payable.
- The first session starts at the configured local business-date boundary. After closing, records remain viewable; new trading requires an explicit next session with a confirmed float. Same-date continued trading is a distinct session. Overdue open sessions are retained for resolution.
- Finalization recalculates under an immediate SQLite transaction, rejects stale fingerprints and prevents duplicate concurrent closes. Retry keys and immutable versions preserve accounting.

## Real fictional demo

**Closing demo** creates actual fictional transactions in an isolated demo account. Reset only reseeds that account.

| Recorded source | Amount |
| --- | ---: |
| Cash / UPI / credit sales | ₹6,000 / ₹3,500 / ₹1,500 |
| Older dues collected, cash / UPI | ₹400 / ₹600 |
| Opening customer dues / drawer float | ₹3,000 / ₹1,000 |
| Cash expenses | ₹700 |
| Net sales / collections / closing customer dues | ₹11,000 / ₹10,500 / ₹3,500 |
| Expected drawer cash | ₹6,700 |

A ₹6,650 count records a ₹50 shortage. A verified second count creates version 2 with ₹6,700 and retains version 1. These figures come from saved transactions.

## Verification

- 160 unit/API/security/accounting tests pass, including 17 closing tests: exact totals, split/current/old credit payments, refunds, safe integers, timezone/DST, stale/frozen snapshots, next sessions, immutable revisions, role/tenant restrictions, suppliers/drawer movements, legacy records, complete histories, demo isolation, actual retry/restart recovery and schedule changes.
- Locale verification passes: 2,010 keys per language, matching variables and no detected hardcoded visible copy. Lint and TypeScript pass.
- All 66 browser checks across 11 suites pass. Suites run sequentially in isolated accounts, with targeted reruns after navigation updates. Closing checks include simultaneous requests, ledger/stock invariance, optional count, versions, PDF totals, today/yesterday history, invoice-specific repayments, supplier/payment details, keyboard tabs and axe accessibility.
- A clean Node 24 production build passes with a fresh lockfile install and isolated database. `scripts/qa/v10-production-review.mjs` checks seven public/security/PWA behaviors, compiled manual closing/PDFs, and an actual timer-driven automatic close of a separate fictional session.
- Nine dashboard widths from 320 to 1,440 pixels have no horizontal overflow. Closing/payment workspaces pass recorded automated axe checks. Physical-device and screen-reader acceptance are separate.
- All six pages of the final three PDF samples were rendered and visually inspected. Each has two A4 pages, searchable shaped text, frozen totals and version/actor/source identity. `scripts/qa/render-closing-pdfs.mjs` regenerates the images with PDF.js. Full repeated headers were verified in the actual image files.

## Release and external limits

Feature changes go through a PR to `dev` and an exact-head Quality check. Production promotion requires release approval. Hosted staging requires the configured HTTPS persistent backend, private volume and verified sender. Local worker verification does not mean Vercel provides persistent SQLite scheduling. See [staging setup](VERCEL_STAGING_SETUP.md).

Owner report sharing uses the native file share sheet or an actual-file download. Internal reports are not delivered to ordinary customers. No live provider message was sent during QA. Real speech accuracy and configured official WhatsApp delivery remain external acceptance checks.

| Browser suite | Passed |
| --- | ---: |
| Closing dashboard | 3 |
| Invoice Studio / delivery | 7 |
| Localization | 9 |
| Premium website | 4 |
| Auth, sales, inventory and isolation | 7 |
| Customer/business details | 2 |
| Sales draft/recovery | 9 |
| Voice inventory | 6 |
| DemandPulse | 8 |
| Voice-created products | 3 |
| Global VoiceOS | 8 |

Representative screenshots, the three fictional closing PDFs and all rendered pages are in [QA evidence](qa/v9-v10/).
