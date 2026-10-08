# DukaanSet product requirements

Version 0.1 · 8 October 2026. Source: the user's DukaanSet master brief. This document records the full product direction and the boundary of the initial working slice. Requirements and acceptance criteria are **not completion claims**. Current delivery/test evidence belongs in the implementation progress and test report.

## Product and user outcome

DukaanSet — **Apni Dukaan, Sab Set.** — is a mobile-first business workspace for Indian merchants. A user should understand sales, collections, customer dues and stock needs immediately, then carry out a daily task through one connected record flow.

Initial categories are grocery/kirana, hardware/electrical, fruit/vegetables, mobile accessories, clothing/fashion and general store. Grocery, hardware and vegetables receive the first operational depth. A single shared domain serves all categories. Secondary capabilities must eventually allow mixed shops without another application or database.

English, Hindi and Hinglish are supported languages. Preference belongs to the user and must persist across businesses; document language may later be chosen separately. Stored product/customer names are not automatically translated. All three intended languages use left-to-right layout.

## Personas, roles and authorization

| Persona | Principal work | Release scope |
| --- | --- | --- |
| Owner | Set up shops, bill, receive stock, collect dues, review closing and export | Initial authenticated user has owner membership in their businesses |
| Cashier | Create bills and record allowed collections without account administration | Planned granular role, invite and permission tests |
| Stock operator | Receive goods and explain adjustments without unrestricted money access | Planned granular role |
| Accountant/viewer | Review reports and trace transactions | Planned read-only role |
| Demo visitor | Explore fictional shops in an isolated session | Initial demo must never populate a real shop automatically |

Membership checks are required for every protected request. Frontend visibility is not authorization. The first slice must not imply staff invitations, fine-grained roles, verified emails or account recovery work before those flows exist.

## Priority and delivery boundary

**P0:** correct daily transaction flow, tenant isolation, durable records and usable phone forms. **P1:** category depth, documents, complete localization and operational reports. **P2:** configured AI, automation, advanced integrations and subscription services.

The initial implementation is a locally runnable development slice with a real persistent SQLite backend. PostgreSQL is the commercial target and a production release gate. It is not a production-ready replacement for the entire master brief. Missing capabilities must be clearly unavailable or omitted from task actions, with their scope retained in the roadmap.

## Requirements traceability

| ID | Master sections | Required behavior | Initial slice boundary / follow-up |
| --- | --- | --- | --- |
| R01 | 1–2 | Original positioning grounded in current competitor evidence | Official-source research and representative browser review; merchant research remains a release activity |
| R02 | 3, 5 | Replaceable SVG identity, brand tokens, consistent components | Centralized original logo and tokens; remaining icon/splash variants tracked separately |
| R03 | 4, 27, 33–34 | Phone-first layout, 44px targets, safe areas, keyboard/focus usability | Core flows across 320–430px and desktop; real budget-device and assistive-technology testing remain required |
| R04 | 6, 21, 25 | Honest marketing, useful public pages, unique metadata and public-only sitemap | Homepage and reusable information pages; editorial/legal and multilingual SEO depth require review |
| R05 | 7, 24 | Secure registration/login/logout, session expiration, recovery | Real email/password login and session cookie; provider-backed reset/verification/OTP are separate integrations |
| R06 | 7–8 | Minimal setup, business switching, capability configuration, backend entitlements | Name/email/password, shop/category/language, isolated multiple businesses; module overrides/team/paid entitlements later |
| R07 | 9, 20 | Derived sales/collections/dues/stock figures, category priorities | Real dashboard values and focused attention cards; no unsupported profit or supplier-order counters |
| R08 | 10, 23, 29 | Atomic invoice + items + payments + stock + audit, precise totals, duplicate defense | Product search, quantities, customer/walk-in, invoice discount, cash/manual UPI, partial/credit confirmation |
| R09 | 10, 28–29 | Draft, cancellation, returns, refunds and traceability | Initial full cancellation refuses bills with later repayments; server drafts, partial returns/exchanges and reviewed refund allocations need dedicated lifecycle work |
| R10 | 11 | Product catalog, stock ledger, shortage validation, min thresholds | Price/cost/unit/quantity/SKU, opening stock, additions and reasoned adjustments; import/export/barcode/valuation depth later |
| R11 | 8, 11 | Category-specific batch, units, daily rates, waste and variants | Decimal units and relevant category defaults; product expiry is not full batch tracking; serial/size/color/conversions later |
| R12 | 12 | Customer histories, derived dues, partial repayment, overdue distinction | Customer balances and oldest-first repayment across unpaid invoices; manual allocation controls/statements and reminder automation later |
| R13 | 13 | Suppliers, receipt event, payable records, order-vs-receipt clarity | Supplier directory and confirmed stock receipts with cash payment; order drafts, other payment methods, later supplier repayment, returns and OCR later |
| R14 | 14 | Today's Work converts real conditions into direct actions | Rule-based low-stock/dues/expiry cards; snooze, assignment and advanced prioritization later |
| R15 | 15 | Today's Hisaab separates cash, UPI, credit, old-dues collections and expenses | Recorded expected cash, actual count, difference and current-day write guard; controlled reopen, historical period locks and adjustments later |
| R16 | 16, 27–28 | Complete English/Hindi/Hinglish copy, errors and text expansion | Central dictionaries and persistent preference; dictionary presence alone does not prove all content is translated |
| R17 | 17 | Approved read-only AI tools, real results, safe failure and tenant checks | Documented provider boundary with honest unavailable state; full live assistant deferred until implemented/tested |
| R18 | 18–19 | Reviewed speech/OCR drafts, user-initiated sharing, accurate documents | Ordinary print/share where supported; provider-backed voice, OCR and automated WhatsApp explicitly deferred |
| R19 | 20 | Practical filtered reports/exports and explained profit estimates | Derived daily/weekly values and record export where implemented; accounting/valuation/profit reports later |
| R20 | 22–24, 29 | Modular typed frontend/backend, migrations, secure access and operations | Next.js/React/TypeScript, validators, native SQLite transactions; PostgreSQL migration and operated backups required for production |
| R21 | 25–26 | SSR public SEO, authenticated private data, safe PWA/network behavior | Metadata/robots/manifest/icons; offline financial writes, sensitive-response caching and Android publication deferred |
| R22 | 24, 31 | Central plans, entitlements, quota and real subscription collection | Plan experiments explicitly unpriced/unavailable; no fake checkout or plan activation |
| R23 | 28, 30, 32 | Isolated demo, empty/error/duplicate states, meaningful evidence | Fictional grocery/hardware/vegetable data; backend and browser verification with known gaps |
| R24 | 35–38 | Actual code, staged completion, release and environment documentation | Working vertical slice plus truthful completed/partial/future record; continuation follows roadmap |

## Information architecture

Public navigation: Features, Business Types, How It Works, Pricing, Help, Login and Get Started. Public pages explain actual capability and limitations; contact cannot invent an organization address or support service. Privacy/Terms remain labelled drafts until reviewed.

Phone application navigation: **Home, Bills, Stock, More**. New Bill remains prominent. More contains customers, suppliers/purchases, collections/payments, expenses, reports, Today's Work, closing, assistant and settings. Desktop can add a sidebar but uses the same concepts. No extra tab is justified merely because a route exists.

The brief's route list may use shared/detail pages or focused sheets. Every requested workflow stays mapped to a requirement even where its final URL changes. Public marketing content and private business data have separate rendering/indexing policies.

## Workflow acceptance contracts

### Registration and first shop

1. Enter identity credentials, shop name, category and language.
2. Create user, business and owner membership consistently.
3. Receive a valid session and an empty real business dashboard.
4. Add first product or deliberately enter isolated demo mode.

Acceptance: duplicate email yields an understandable error; password is hashed; failure does not leave an orphan business; logout invalidates the session; business data is absent from an unauthenticated response. A reset link is not presented as sent without a real delivery adapter.

### Confirm sale and collect partially

1. Home → New Bill; choose searchable products and quantity.
2. Choose named customer or walk-in, discount and received amount.
3. Review authoritative totals and explicitly confirm.

For the brief's ₹1,000 sale and ₹600 payment, expected invoice balance is **₹400**. In one database transaction, save invoice/line snapshot, payment, stock movements and audit. A ₹400 credit balance requires an identifiable customer. Walk-in unpaid/partial bills must be rejected or converted to a named customer before confirmation.

Acceptance: negative/zero quantity, stock shortage, invalid discount, payment exceeding bill, foreign-tenant product/customer and duplicate item abuse are rejected. A repeated identical idempotency key yields the same result; the same key with a changed payload is rejected. Failure creates no partial invoice, payment or inventory deduction.

### Customer repayment

Open customer or unpaid bill → enter amount and method → review → record. Balance derives from transaction/allocation history, not an independently editable customer total. The initial backend allocates one customer repayment oldest-first across unpaid invoices; a separate payment record represents each allocation. Manual selection/allocation preview is a follow-up. Acceptance: no over-allocation; cancelled bills cannot receive new payments; duplicate protection; current and overdue dues remain distinct when presented as such.

### Inventory and purchasing

Add catalog product → opening quantity records a movement. Receive goods → choose supplier/items/quantity/cost/payment → confirm receipt → inventory increases transactionally. An order proposal does not increase stock. Adjustments/wastage require reason and audit. Acceptance: 500g sells as **0.500kg**, not 500kg; stock never becomes negative under the configured no-negative-stock policy; financial product names/prices remain snapshotted on old invoices after catalog changes.

### Cancellation and returns

Confirmed → cancelled is an authorized, audited reversal; never silently erase the original invoice. Restore stock exactly once and record refund movements for money originally received. The initial implementation refuses cancellation when later credit repayments exist, requiring a future reviewed adjustment flow. Repeat cancellation must not double-restock or double-refund. Partial return/exchange and credit-note lifecycles remain separate follow-up requirements; they cannot be inferred from full cancellation support.

### Daily closing

Review recorded cash/UPI/credit and old-dues collection → enter opening cash and counted cash → confirm difference. Cash basis is **opening cash + cash collections − cash refunds − cash supplier outflows − cash expenses ± explicit cash adjustments**, according to supported records. The first purchase flow records its paid amount as cash; separate supplier UPI/bank payment and cash-adjustment records remain future work. UPI collections are excluded from drawer cash. Manual UPI is not verified settlement. A closing blocks new current-day invoices, payments, purchases and expenses; controlled reopening and historical period protection remain future work before accounting-period finality can be claimed.

### Today's Work and business switching

Low stock, overdue invoice and near-expiry condition each link to the relevant stock/customer/batch action. Dismissing an alert does not settle a debt or fix a stock balance. Business switching changes all metrics, records, tasks and permitted actions, and scopes draft restoration to business/user. No business A result appears while business B is active.

## Financial correctness invariants

- Money uses integer INR **paise**; UI rupees convert through validated decimal input. Backend is authoritative.
- Quantities use integer **thousandths** of the product's canonical unit. Unsupported precision and invalid unit combinations must be rejected.
- Line values use explicit round-half-up at the minor unit. Invoice totals sum rounded lines, then subtract validated invoice discounts. GST service is not implemented by merely adding a percent input.
- Confirmed active invoice: total = recorded applied payments + outstanding. Paid/partial/unpaid are derived from these values.
- Inventory is explainable by immutable signed movements; mutable quantity is a guarded projection.
- Sales, money received, credit, gross margin and net profit are different measures. Do not display profit without appropriate cost/expense/valuation data.
- Financial corrections append traceable reversal records; historical originals retain their identity.
- All reads, writes, calculations, exports and future AI tools are tenant-scoped.

## Nonfunctional acceptance

| Area | Acceptance target | Verification needed |
| --- | --- | --- |
| Responsive | No unintended overflow at 320, 360, 375, 390, 412, 430px; also tablet and desktop | Browser flow/layout checks, long names/amounts and Hindi text |
| Accessibility | WCAG 2.2 AA target, keyboard/focus support, labelled inputs, no color-only statuses | Automated checks plus keyboard/screen-reader review; no unsupported conformance claim |
| Performance | LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 as targets | Lab profiling and eventual field data; build success is not a performance audit |
| Reliability | Transaction rollback, repeat submission safety, recovery from API failure | Integration tests and interrupted-request scenarios |
| Security | Tenant checks, secure sessions, input validation, origin/CSRF defense, no client secrets | Cross-tenant tests, session tests, dependency and deployment review |
| Localization | Persist language; translate forms, errors, statuses and help, not only navigation | Dictionary parity and end-to-end rendered text review |
| Privacy | Minimized data, protected exports, retention/deletion policy | Implemented access tests and legal/operational review |
| Offline | Honest network state and safe form preservation | Disconnect/reconnect tests; no synced-success claim for unacknowledged writes |
| PWA | Manifest/icons and secure deployment readiness | HTTPS installation tests; no claim of Play Store compliance |

## External integration and release constraints

No API key, OTP provider, speech provider, messaging account, payment merchant account, cloud database, object storage or live deployment is assumed. Every unavailable boundary must say so clearly. Environment variables describe future configuration; they do not mean the integration is working.

The working brand is not legally cleared. GST/privacy obligations, domain/trademark clearance, legal copy, pricing, payment-provider onboarding, production hosting and irreversible deployment require their proper review/authorization before commercial launch. Ordinary invoices must not be labelled government-registered e-invoices. The development slice must stay useful without AI, voice, OTP, OCR or paid service credentials.
