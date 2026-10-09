# DukaanSet implementation progress

9 October 2026. This is a code-backed local vertical slice, not completion of the full master brief. Current V2 checks passed: 58 unit/API tests, 24 browser scenarios, TypeScript, the production build and 7 production smoke checks. The [V2 QA report](v2-test-report.md) records evidence and coverage limits. The baseline tables below describe V1; the V2 update near the end records the new implementation and supersedes its earlier gap list.

## Current delivery

| Area | Source-backed delivery | Remaining boundary |
| --- | --- | --- |
| Research and planning | Official-source competitor review, representative rendered public-page review, requirements/architecture/roadmap | Direct merchant interviews and usability/time-to-bill targets remain unvalidated |
| Brand and public site | Original centralized SVG logo variants, PNG/maskable icons, public illustrations, home and feature/category/help/legal draft pages | Legal clearance; complete Hindi public-page parity and editorial review; no paid plans or live service claims |
| App foundation | Protected route shell, desktop navigation and phone Home/Bills/Stock/More pattern, loading/error/empty states, operation sheets | Responsive, accessibility and device coverage require recorded verification |
| Accounts and onboarding | Name/email/password, business/category/language registration, hashed passwords, real session/login/logout, new empty businesses | Email verification, password reset/OTP, account deletion and staff invitations unavailable |
| Tenant boundaries | Owner membership checked on server routes and related product/customer/supplier/invoice records; business switching and scoped draft storage | Owner-only access; granular cashier/stock/viewer roles, mixed module settings and cross-device administration later |
| Languages | English/Hindi/Hinglish dictionaries, saved user preference, financial error codes and task interpolation; document language updates | Full marketing/error/long-text/assistive-technology review is pending; user names remain unchanged |
| Home and category views | Server-derived sales, signed collections, customer dues, stock alerts, weekly sales and category priorities | No fabricated profit; richer configurable modules, category workflows and reports later |
| Catalog and inventory | Price/cost/SKU/unit/opening stock/minimum/expiry, reasoned receipt/wastage/correction ledger, stock bounds and whole-piece validation | Product expiry is not batch stock; no barcode import, size/color/serial variants, daily price history or rational unit conversion |
| Billing | Search products, exact decimal quantities, customer/walk-in, invoice discount, cash/manual UPI, paid/partial/unpaid records, ordinary invoice detail and print | No implemented GST service/government e-invoice, reusable server drafts, partial returns/exchanges or invoice delivery integration |
| Customer credit | Derived balances, bill history, due dates and oldest-first partial repayments | Manual/grouped allocation, customer statements, excess credit and automated reminders later |
| Reversal and retry | Full cancellation restores stock and records signed refund once; stable keys for invoice/payment/purchase and UI stock/expense attempts | Cancellation refuses later repayments; stock/expense API still permits keyless callers; reviewed return/refund allocation later |
| Suppliers and purchases | Supplier contacts, received-stock purchase records, cash-paid amount and remaining payable balance | Cash-only purchase payment, no later supplier repayment ledger, purchase-order drafts, purchase returns or OCR |
| Daily operations | Rule-based low-stock/dues/expiry tasks and direct actions, expenses, cash closing with expected/actual/difference | No assigned/snoozed task lifecycle; closing has current-day financial guard, no controlled reopen/historical period-lock model |
| Reports and export | Basic derived sales/collections/dues/stock views and authenticated business JSON export | Filtered/paginated reports, formal statements, valuation/accounting and bulk CSV/XLSX import/export later |
| Persistence and security | Node native SQLite schema v1, transactions, foreign keys/WAL, salted scrypt, hashed sessions, matching Origin, bounded JSON, no-store responses and security headers | PostgreSQL/forward migrations, account recovery, distributed throttling, operated backups and production ingress review outstanding |
| Demo | Each demo session owns separate fictional grocery/hardware/vegetable businesses and linked financial/stock records | No real merchant data is inserted as demo; service limits/expiry/cleanup need operation policy before public demo traffic |
| SEO and PWA | Public metadata, canonical base URL, sitemap/robots, private noindex handling, manifest/icons and public-only offline fallback | Final domain/SEO validation, HTTPS installation tests, draft/sync/device lifecycle work and Play publication later |
| AI and external providers | Explicit unavailable UI/API and documented permission-safe future architecture | No live AI, speech/OCR, automated WhatsApp, provider-verified UPI, subscriptions or government submission |
| Delivery documentation | README commands, environment example, deployment/security boundaries and this staged record | No live deployment; final results in the QA report |

## Connected local workflow

The intended implemented path is register or open an isolated demo → choose a business/language → create products and a customer → confirm a bill → update invoice, payment and inventory atomically → collect customer dues → receive supplier stock → record expenses/wastage → review tasks → reconcile cash closing. Refresh/restart persistence is provided by the database, not by static mock cards.

Use the requirements acceptance examples: a ₹1,000 named-customer bill with ₹600 received leaves ₹400 due; 0.500kg sells half a kilogram; cash closing excludes UPI and uses net refunds. The server owns amounts and business-day aggregation (Asia/Kolkata). A cancellation keeps historical identity/amounts but exposes no collectible balance. Print output is an ordinary invoice; browser Save as PDF is not a dedicated PDF generation service.

## Validation evidence and pending review

The repository includes backend/client tests and Playwright scenarios. Presence of a test does not establish a passing run. The final QA report should record exact commands, runtime, results, relevant viewports and unresolved defects against the final source revision.

| Check | Command or evidence | State at this documentation revision |
| --- | --- | --- |
| TypeScript | `npm run typecheck` | Passed, exit 0 |
| Backend/client | `npm test` | Tests cover integer/rounding/date parsing, transaction rollback/shortage, retries, payment/cancellation/purchase/closing, tenant access, cookies/CSRF, demos and reopen persistence; 26 passed, zero failed |
| Bundle | `npm run build` | Passed, exit 0; production smoke also passed 7 checks |
| Browser | `npm run test:e2e` | 7 passed, zero failed; see QA report |
| Source localization checks | Auth/i18n focused esbuild and runtime checks performed during integration | Syntax passed; 28 detected backend codes covered in all 3 languages; task names/interpolation and document en/hi/hi-Latn switching passed; not full visual/language conformance |
| Merchant/field performance | Merchant testing and target-device measurements | Not performed; no task-time/Core Web Vitals guarantee |

Representative browser scenarios in source cover public pages/SEO/phone layout, account onboarding and partial repayment persistence, languages/business switching, 500g sale/cancellation/refund, expenses/closing, protected routes, tenant rejection and CSRF. These scenarios do not cover all edge cases in the master brief. Accessibility and mobile acceptance need actual run evidence, not only screenshots or dictionary entries.

## Next implementation order

1. Follow up on physical-device, screen-reader, print/PDF and HTTPS installation checks in the QA report; retain the current passing transaction, localization and tenant regressions.
2. Strengthen the shared financial model: versioned migrations, normalized line/payment references, supplier repayment/methods, manual customer allocation, reviewed returns/refunds, historical close/reopen policy and pagination.
3. Build category depth: expiry batches/barcodes, hardware unit/variant rules, vegetable daily rates and reviewed waste flows; keep all on shared transactional services.
4. Add account recovery/verification, fine roles, retention/deletion, protected backups and release infrastructure. Implement PostgreSQL and multi-process correctness before commercial operation.
5. Implement configured read-only AI with permitted tools and real failure tests; then reviewed speech/OCR/draft actions and messaging. Activate paid subscriptions and settlement verification only through legitimate tested providers.
6. Add full offline synchronization and evaluate Android distribution as dedicated phases. Validate with merchants, accessibility/device/performance evidence and appropriate legal/tax review before publication.

Detailed acceptance gates remain in [requirements](requirements.md), [roadmap](roadmap.md), [architecture](architecture.md) and [deployment preparation](deployment.md). The project has not been deployed, and the larger master product is unfinished.

## V2 update · 9 October 2026

The sections above record the V1 delivery checkpoint. V2 now implements several previously listed gaps; this update describes the actual new scope. The [V2 audit](v2-audit.md) records the preserved baseline, and [V2 implementation](v2-implementation.md) documents API, migration, reset and storage limits. The three supplied V2 briefs are saved verbatim in [docs/briefs](briefs/v2-master.md).

- Sales support distinct cash and manual UPI receipts on the same invoice, remaining customer credit, product-linked private photos and explicit confirmation. Cancellation records a signed refund per original method so cash closing excludes UPI. The Fashion demo has four Blue Casual Shirts at ₹899 and Rahul with no prior due; two shirts, ₹1,000 cash and ₹500 UPI produce ₹1,798 total, ₹298 due and two shirts left.
- Product editing, aliases, descriptive variations, barcode text and configured pack sizes are available. Existing invoices preserve item snapshots. Reviewed stock batches support compatible gram/kilogram and millilitre/litre conversion, metre and piece units, configured pack receipt conversion, atomic rollback, idempotent retry and entry history. Product-level expiry attention is available; batch expiry and advanced selling conversion matrices are still future work.
- Voice inventory uses deliberate browser speech activation where supported, English/Hindi/Hinglish matching and editable review before receipt confirmation. Typed/manual fallback remains available. No remote STT or LLM service is connected, and the backend retains neither raw audio nor transcript text. Physical-device microphone support and recognition accuracy still require validation.
- Customer totals and daily/business reports now use complete-ledger server aggregates. Authenticated customer statements have an explicit download limit rather than silent truncation. The app generates ordinary invoice and statement PDFs locally and exports product CSV; no CSV import or GST portal integration is claimed.
- SQLite migration v1→v2 preserves existing accounts, sessions and business ledgers. Demo reset is transactional and limited to the authenticated isolated demo, retains user/language/session and existing business IDs, and adds Fashion to an older three-business demo. Product/contact identities are reseeded. Real or shared business data is refused. Fresh demos contain grocery, hardware, vegetables and Fashion.
- Invoice photos are authenticated private database blobs outside public assets, with actual image decoding, metadata removal, bounded uploads, tenant checks and immutable saved-invoice attachments. Local sale/voice drafts are scoped to user and business. Final browser QA must verify acknowledgement-loss retry and reset behavior against the final source.

Contact creation now also accepts an optional retry key for customer/supplier attempts, returning the original contact after an acknowledgement loss while preserving deliberate duplicate creation with a new key. The V2 backend/client checkpoint passed 58 tests with zero failures, and TypeScript passed after the public-copy and contact changes. The root task records final source checks, build and browser results in the [V2 test report](v2-test-report.md); these checkpoint results do not imply device, live hosting or HTTPS installation verification.

Owner-only permissions, Node/SQLite persistence and online transaction confirmation remain the operating boundaries. PostgreSQL, staff roles, account recovery, supplier repayment, partial returns, offline financial sync and production operation remain later work. Live AI needs a provider adapter to be implemented and tested as well as credentials; `OPENAI_API_KEY` is currently unused. No deployment or commercial readiness is claimed.

## V3 update · 9 October 2026

The earlier sections are historical V1/V2 checkpoints. V3 implements account verification/recovery, progressive shop setup, owner/manager/staff access, module/notification configuration, reviewed catalogue CSV import and optional configured read-only AI. `OPENAI_API_KEY` now activates the adapter only together with `AI_PROVIDER=openai` and an explicit `OPENAI_MODEL`; it is not configured or exercised with paid calls in this delivery.

DemandPulse connects Nahi Mila requests from stock/sales, exact variant matching, grouped demand, reviewed reorder drafts, actual purchase receipts, consent-aware manual contact, customer request history and explicit saved-invoice attribution. Quantity, request count, distinct saved customers and reported visitors are separate. Stock receipt/contact alone never counts as recovered revenue; cancelled invoices reverse attributed net revenue. Daily work, compact dashboard previews and reports use saved records with role filtering.

The pre-V3 backup was rehearsed and the actual local database upgraded to schema 3 with integrity/FK checks and original columns/values in 17 existing tables unchanged. No real shop was reset or seeded. A new/reset fictional demo supplies Fashion XL, hardware pipe and uncatalogued grocery demand scenarios.

Final checks: TypeScript and production build passed; 88 unit/API/client/voice tests, 32 full-suite browser scenarios and 7 production smoke checks passed. The enhanced custom staff-permission browser scenario also passed after the final UI access change. English/Hindi/Hinglish Demand/settings/sale layouts were checked at 320/390/768/1440px with automated Demand-page/sheet accessibility checks and rendered screenshots. See the [V3 QA report](v3-test-report.md), [completion and limits](v3-implementation.md) and [audit](v3-audit.md).

Node/SQLite persistence and online confirmation remain the runtime boundaries. Real HTTPS hosting, configured sender/model acceptance, physical-device/screen-reader/merchant checks, distributed operation, PostgreSQL, supplier repayments, partial returns, billing subscriptions, OCR/hosted STT, offline financial synchronization and nearby merchant networking remain future gates. No deployment, automatic messaging or commercial readiness is claimed.
