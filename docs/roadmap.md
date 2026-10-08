# DukaanSet staged implementation roadmap

8 October 2026 · Follows the user's implementation order. The first delivery is a **working local vertical slice**. This roadmap retains the larger commercial scope; a planned item is not an implemented feature.

## Delivery policy

Every major slice has a user workflow, data/API contract, implementation, connected-state test and responsive review. Mark completion only with evidence. Any credential-dependent integration stays explicitly unavailable until its adapter, configuration and tests exist. Never charge, deploy, send messages or claim compliance by inference from a placeholder.

The current database choice is persistent local SQLite. PostgreSQL, operated backups and multi-process concurrency tests are required commercial release work. A demo sandbox is isolated from real registrations. Ordinary recorded UPI and invoices are not provider-verified payments or government-registered e-invoices.

## Stage plan and acceptance gates

| Stage | Scope and user result | Acceptance gate | Delivery boundary |
| --- | --- | --- | --- |
| 1 — Research/architecture | Evidence-based positioning, roles, scope, IA, invariants and data model | Official source links, assumptions marked, selected architecture recorded | Desk research plus representative public browser review; merchant validation remains open |
| 2 — Brand/marketing | Original logo, tokens, responsive homepage, category preview, feature/pricing/help pages, metadata | No copied assets/fake testimonials; all CTAs lead to real routes; phone layout and SEO checks | Legal placeholders and pricing experiments visibly unfinalized; complete public translation/content follow-up |
| 3 — App foundation | Real email/password sessions, concise setup, business/category/language, Home/Bills/Stock/More | Protected routes, logout/expiry, persistent language and business scope verified | Owner-only access; recovery/verification/OTP/staff roles deferred |
| 4 — Connected core | Products, stock, customers, confirmed sales, payments, suppliers and receipts | Transaction correctness, duplicate defense, shortage/tenant tests, real persistence | Cash-only receipts, oldest-first customer repayment and cancellation without later repayments first; normalized groups/manual allocation/draft/return lifecycles next |
| 5 — Category experience | Shared grocery/hardware/vegetable configuration and meaningful tasks/units | Configuration changes actual priorities and rules without data mixing | Product expiry and decimal quantities first; batches/conversions/variants/serial/warranty later |
| 6 — Daily operations | Today's Work, expenses, closing, practical reports, ordinary documents | Cash-vs-UPI formula, direct task actions, accurate print totals, refresh consistency | Basic current-day write guard; controlled reopening/historical locks, supplier repayment, statements and richer exports/report filters later |
| 7 — AI | Read-only questions answered from approved tenant tools | Real provider, schema validation, denial/failure/injection/cross-tenant tests | Honest unavailable state until live adapter exists; confirmed write drafts, OCR and speech later |
| 8 — Hardening/release | Responsive/accessibility/performance/security/SEO/PWA checks, operations and documentation | Test report, known issues, deployment/run instructions, reviewed production gates | Local slice may ship for review; commercial publication waits for remaining gates |

## Initial vertical slice review checklist

This is the initial slice's acceptance checklist; it is not a claim every check has passed. See the delivered implementation/test report for actual results.

- Register a new account and obtain an empty persistent business.
- Add a product with price, cost, canonical unit, opening stock and low-stock threshold.
- Add a customer, create ₹1,000 sale, record ₹600 cash/manual UPI and show ₹400 due.
- Refresh/restart and verify invoice, stock, payments and balance persist.
- Record a partial/final repayment without exceeding the balance.
- Reject a repeated changed request and safely replay an identical request.
- Confirm received supplier stock and increase inventory exactly once.
- Record expense/wastage/adjustment with reason and ledger history.
- Cancel a bill through an audited full reversal without double-restock/refund.
- Derive home measures and actionable low-stock/dues conditions.
- Review expected drawer cash, enter actual count and preserve the difference.
- Switch isolated businesses and persistent languages without carrying records across tenants.
- Explore explicitly fictional grocery/hardware/vegetable demo data.
- Use bill/stock/customer forms across representative phone widths.
- Reach an honest unavailable state for unimplemented AI/voice/OCR/providers.

## Next implementation sequence

### A. Complete core before expanding AI

1. Normalize invoice/purchase line tables and many-to-many payment allocations with migration tests.
2. Add server-persisted bill drafts, customer creation within bill and safe scoped draft recovery.
3. Implement many-invoice collection preview, supplier repayments and unallocated credit rules.
4. Add partial returns, refunds, purchase returns and credit-note references with lifecycle tests.
5. Add confirmed/draft purchase distinction and pending-order dashboard semantics.
6. Add full document/export workflows with tenant authorization and generation failures.
7. Complete translation coverage for forms, errors, notifications, reports and help.
8. Extend the current-day write guard with cash adjustments, controlled reopen and historical period protection.

Acceptance: accounting equations and stock history remain reconstructable through all corrections, repeated requests and business switches.

### B. Add category depth

Grocery: batch stock, expiry-aware picking, barcodes, pack/loose units and expiring-batch tasks. Hardware: rational unit conversion, boxes/pieces/metres, supplier reorder lists and variants. Vegetables: explicit effective-dated daily rates, fresh receipts, grams/kg entry, wastage and quality attributes. Clothing/mobile: variant stock, exchanges, compatibility, warranty/serial policies after shared core is stable.

Acceptance: category controls affect supported backend behavior, not just decorative metrics. A product-level expiry date or price edit must not be sold as a complete batch/daily-rate subsystem.

### C. Add team and commercial foundations

Invites, owner/cashier/stock/viewer permissions, mixed-shop module overrides, server entitlements, export/deletion/retention controls, account recovery/verification, centrally configured plan lifecycle and provider-verified subscription events. Keep AI quota and payment collection distinct from a UI upgrade button.

Acceptance: unauthorized actions fail at API/tool level, downgrade behavior is defined and data is not lost on plan changes.

### D. Implement provider-backed assistance

Start with read-only daily sales/collections/dues/low-stock tools. Add real provider timeout, schema validation, consent/data minimization, quotas and costs. Later add proposed invoice/reminder/reorder drafts requiring explicit preview/confirmation. OCR and voice require reviewed extracted/transcribed drafts; messaging requires legitimate integration and recipient consent.

Acceptance: numbers come from authorized tools, cross-tenant/denied actions fail, malformed outputs cannot alter records, provider downtime preserves ordinary operations and no financial write happens on ambiguous speech alone.

### E. Offline and Android phase

Begin with safe draft preservation and explicit network state. Full offline invoicing needs a separate synchronization protocol, encryption/storage decisions, device identity, conflict handling, stock reconciliation and reliable replay. Evaluate TWA/native shell and current Play policies only after the web product is stable and before a real publication decision.

Acceptance: unsynced bills never display as synced; duplicates and stock conflicts reconcile safely; private records are not indiscriminately cached on shared devices.

## Commercial release gates

| Gate | Required evidence before commercial release |
| --- | --- |
| Merchant validation | Real users understand sales vs collections and complete billing/collection/closing on budget phones; comparative claims supported by data |
| Storage | PostgreSQL adapter/migrations and tested multi-process invoice/stock/idempotency behavior; restore drill and backup owner |
| Authentication | Recovery/verification policy, session expiration/revocation, production origin/HTTPS/CSRF defense and distributed rate limiting |
| Authorization | Owner/staff role tests, cross-tenant list/detail/write/export/document/AI denial tests |
| Financial scope | Supported tax treatment reviewed; ordinary invoices distinguished from government e-invoices; returns/allocation/closing rules verified |
| Security/privacy | Secrets management, safe logs, retention/export/deletion implementation, applicable Indian legal review |
| Documents/integrations | Actual generated invoices/exports and real configured adapters with failure/retry/idempotency tests |
| Responsive/a11y | Phone width matrix plus long text/amounts, keyboard, focus, Hindi, screen readers and reduced motion reviewed |
| Performance | Lab evidence, bundle review, budget Android checks and field-monitoring readiness; no perfect-score guarantee |
| SEO/brand | Verified domain/canonicals/sitemap, original public content, legal identity/trademark review and no private index exposure |
| PWA/operations | Secure install verification, offline limitations, health/error monitoring, deploy/rollback/migration and incident procedures |
| Pricing | Reviewed commercial prices, period/tax/limits clarity, provider setup and real subscription event verification |

## Progress status discipline

Use four statuses: **implemented and verified**, **implemented but limited**, **unavailable integration**, **future scope**. Keep exact tests and known issues with the current release artifact. Do not mark all eight stages complete because a subset of their screens exists. The first session is successful only when a real connected slice works and its limitations are disclosed; the master product remains staged work.
