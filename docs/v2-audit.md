# DukaanSet V2 baseline audit

Audit date: 9 October 2026. This audit covers the existing local application before V2 changes and the concrete extension strategy. It does not certify commercial production readiness.

The supplied briefs are preserved verbatim in [V2 master](briefs/v2-master.md), [smart sales](briefs/v2-smart-sales.md), and [voice inventory](briefs/v2-voice-inventory.md). The later sales and voice briefs determine the detailed confirmation workflows.

## Baseline evidence

- `npm test` passed **26/26** existing backend/client tests before V2 edits.
- The existing application uses Next.js App Router, React, TypeScript, local fonts, translation dictionaries, Radix sheets, and a shared business context.
- Backend services use Node 24 native SQLite with durable storage at `DATABASE_PATH` or `.data/dukaanset.sqlite`.
- The installed Next route-handler documentation was read before server edits. Repository instructions explicitly require the bundled documentation because this framework version may differ from older releases.
- Browser, narrow-screen and production verification are recorded separately in the QA report. Source inspection alone is not evidence of a successful browser workflow.

## What already worked

| Area | Existing working foundation |
| --- | --- |
| Accounts | Real email/password registration and login; salted scrypt hashes; random HttpOnly cookie sessions stored as hashes; logout and expiry |
| Isolation | Every business read/write checks membership and scopes related product/customer/supplier/invoice IDs |
| Billing | Authoritative integer paise arithmetic, historical item snapshots, discounts, partial payment, customer credit, stock deduction and audit in a single transaction |
| Duplicate prevention | Invoice, repayment and purchase idempotency; optional compatible idempotency for stock and expenses |
| Repayments | Oldest outstanding invoice allocation; overpayment rejected; customer balances derived from ledger records |
| Reversal | Audited full cancellation, stock return and signed refund DTO; later repayments prevent an unsafe cancellation |
| Inventory | Product creation, opening movements, receipts, wastage/corrections, low-stock and expiry tasks; integer thousandths and whole-piece restrictions |
| Purchasing/closing | Received goods update stock/cost/supplier due; cash-only purchase payments; expenses; India business-day closing and financial write lock |
| Demo | Each session creates its own fictional grocery, hardware and vegetable businesses |
| Public/PWA | Public pages, manifest/icons, service-worker public offline fallback, private route protection and no private API caching policy |

## Gaps identified

| Gap | V2 treatment |
| --- | --- |
| One receipt method per sale | Add distinct cash/UPI receipt rows while retaining the legacy amount input |
| Step-heavy billing and no item photos | Reuse the same transactional sale engine with a single-screen confirmation UI and private product-linked photos |
| No Fashion presentation fixture | Add the exact shirt/Rahul example with zero pre-existing customer dues |
| No demo reset | Add a transactional demo-only reset retaining user, language, session and existing business IDs |
| No product edit/aliases | Add validated updates and historical-unit locking; preserve invoice snapshots |
| No confirmed voice inventory batch | Add a reviewed parser workflow and one atomic server batch with linked movements/history |
| Recent-history caps used as report totals | Add all-ledger business/customer aggregates and a complete scoped customer statement endpoint |
| No schema upgrade sequence | Add an additive, tested V1 → V2 migration |
| HMR could mix domain-error class identities | Use a stable symbol brand on genuine server errors and replace stale local-store revisions |

Existing visual styling, shared controls, account/session behavior, ledger rules and localization were reusable. V2 adds feature components rather than replacing the application or independently recalculating financial records in the browser.

## Non-destructive storage evidence

Schema V1 remains the bootstrap definition in `src/lib/server/schema.ts` and `migrations/001_initial.sql`. V2 is additive in `src/lib/server/migrations.ts` and `migrations/002_sales_inventory.sql`:

1. Add product aliases, barcode, variation and optional pack size with safe defaults.
2. Add inventory-entry history and private attachment tables/indexes.
3. Set `PRAGMA user_version = 2` only in the migration transaction.

Opening a V1 database runs the forward migration within `BEGIN IMMEDIATE`; it does not recreate tables or delete merchant records. V2 databases reopen without repeating the migration. A schema newer than the application is rejected.

The migration regression constructs a populated V1 database with products, a partially paid invoice, movements, audit records and a hashed session. After upgrade and another reopen, it verifies the original IDs, stock, payment, customer due and authenticated session. Tests use temporary databases; no test resets the actual merchant database.

Demo reset is a separate explicit operation. It requires a demo user, refuses shared businesses, scopes deletion to that user's demo business IDs, reseeds inside the same transaction, and retains account/language/session/business identities. A late shared-business failure is tested to roll back earlier deletes as well. Real merchant and another demo's state are verified unchanged.

## Remaining constraints

SQLite is a durable local implementation, not a PostgreSQL deployment or a tested distributed SaaS backend. Role names in the schema do not establish staff permissions. Product-level expiry is not a batch-expiry ledger. Variation text is not a complete variant matrix. Full cancellation is not partial returns/exchanges. External AI, bank verification, WhatsApp, email recovery, subscriptions and government invoicing remain unavailable. Real Android microphones, accents/noise, HTTPS installation and deployment behavior require separate device/ingress validation.

See [V2 implementation and API details](v2-implementation.md) and the final [V2 test report](v2-test-report.md). Older V1 architecture/deployment notes describe the baseline; the V2 migration and contract details here supersede their V1-only statements.
