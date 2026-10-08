# DukaanSet implementation progress

9 October 2026. This is a code-backed local vertical slice, not completion of the full master brief. Status below describes implemented source and its limits. Final local checks passed: 26 backend/client tests, 7 browser scenarios, TypeScript, the production build and 7 production smoke checks. The [QA report](test-report.md) records evidence and coverage limits.

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
