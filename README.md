# DukaanSet

V11.1 adds a compact global conversational VoiceOS with multi-turn customer, billing, payment and expense drafts. V12 shares automatic new-product preparation, separated purchase/selling prices and one atomic **Save All Stock** action between the global assistant and stock workspace. See [architecture, examples and limits](docs/v11-v12-voiceos.md) and [verification evidence](docs/v11-v12-test-report.md).

V9 adds a compact premium dashboard and complete record detail pages. V10.1 adds reviewed daily closing, separate cash/UPI reconciliation, immutable reports, optional physical counts, explicit next sessions and opt-in automatic closing on the persistent backend. See [V9/V10 verification and accounting policy](docs/v9-v10-test-report.md). The separate **Closing demo** uses real fictional transactions to demonstrate the ₹6,700 drawer calculation.


The V8 public website uses the refined storefront identity, fictional interactive sale/VoiceOS/DemandPulse previews, six business categories and redesigned multilingual auth screens. See [brand usage](public/brand/USAGE.md) and [V8 implementation and verification](docs/v8-test-report.md). Commercial pricing and direct WhatsApp setup are labelled honestly; previews never write business records.

**Apni Dukaan, Sab Set.** A mobile-first, three-language workspace for sales, stock, customer dues and missed demand. V4 adds one shared VoiceOS engine and global/contextual voice drafts to the transactional billing, inventory, payments and DemandPulse workflows.

Source: [Daksh009739/DukaanSet](https://github.com/Daksh009739/DukaanSet). See the [V3 implementation and limits](docs/v3-implementation.md), [QA report](docs/v3-test-report.md) and preserved [V3 brief](docs/briefs/v3-master.md).

For the earlier VoiceOS foundation, see [setup, architecture and demo A–E](docs/v4-voiceos.md), [V4 test results](docs/v4-test-report.md) and the [V4 brief](docs/briefs/v4-voiceos-master.md). Real browser speech recognition has typed fallback; device transcription accuracy and live staging remain explicit validation limits. Recognised commands prepare reviewed drafts; they do not automatically save or send messages.

## Run locally

Use **Node.js 24+** and npm. Native `node:sqlite` is required. No paid provider or separate database server is needed for the local workflows.

```powershell
npm ci
if (-not (Test-Path -LiteralPath .env.local)) {
  Copy-Item -LiteralPath .env.example -Destination .env.local
}
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). Choose the labelled demo for fictional grocery, hardware, vegetable and Fashion shops. Fashion includes an unavailable XL shirt with recorded demand; hardware and grocery include other demand scenarios. Demo reset is explicit and refuses real/shared business data.

For a new account, register name, email, confirmed password and language, then confirm the verification link before setting up the shop. With local `AUTH_EMAIL_MODE=file`, links are written to the **private** `.data/dukaanset.sqlite.mail/` outbox, not sent by email. Open the matching JSON file locally and visit its `url`; tokens must remain private. Verification links expire after 24 hours and reset links after 30 minutes. Onboarding offers Add Product, reviewed CSV import, a separate fictional demo, or Skip. Existing accounts and records survive the upgrade; legacy email addresses are not falsely marked verified.

The development server binds to loopback. Use `npm run dev -- --port 3002` for another port and set `AUTH_BASE_URL` to that local origin for correct links. The script runner can select installed Windows Node 24 at `C:\Program Files\nodejs\node.exe`; `DUKAANSET_NODE` accepts another absolute executable path.

## Persistence and providers

The default database is `.data/dukaanset.sqlite`, with SQLite WAL journaling. `DATABASE_PATH` chooses durable private storage. Business data, tokens, password hashes, private photos, local outbox files and backups are ignored by Git. A Git push preserves **source**, not merchant data. Never expose them through `public/` or commit `.env.local`.

The additive schema migrations upgrade earlier databases to version 7 and reject newer versions. Run `npm run backup` before upgrading; the command creates a SQLite-consistent snapshot under `.data/backups/` and checks integrity/foreign keys. Keep a protected copy elsewhere and restore only with the application stopped and the matching source revision. No scheduled backup service is included.

[.env.example](.env.example) documents server-only configuration. Production account email requires `AUTH_EMAIL_MODE=resend`, a trusted HTTPS `AUTH_BASE_URL`, `AUTH_EMAIL_FROM` and `RESEND_API_KEY`. File delivery is disabled in production. Live delivery through a verified sender still requires an operational test.

The optional read-only AI adapter activates only when `AI_PROVIDER=openai`, `OPENAI_API_KEY` and an explicit `OPENAI_MODEL` are configured. It sends a permitted, reduced business snapshot only after the user asks a question; it cannot write stock, orders, invoices or messages. Unconfigured/provider failures remain visible and the rules-based summaries continue working. Provider retention terms apply. `DATABASE_URL` is still unused; it does not switch the app to PostgreSQL.

## Connected workflows

- Sales: reviewed ordinary invoices, cash/manual UPI/split receipts, credit, private product photos, Unicode invoice/statement PDFs, customer repayments and explicit full cancellation with signed refunds.
- Inventory: products/aliases/descriptive variants, compatible reviewed stock conversions, purchases, stock history, product expiry, waste adjustments and atomic CSV catalogue import with opening stock. CSV import adds products and refuses conflicting SKUs.
- DemandPulse: catalogue or free-text requests, exact product/variant matching, separate quantity/customer/visitor counts, grouped demand, reviewed reorder drafts, actual purchase receipts, consent-aware message preparation, manual contact records and explicit attribution to saved invoice quantities. Cancellation reverses attributed revenue and reopens the remaining demand.
- SaaS: progressive onboarding, account profile/password, one-use verification/reset/invitation links, owner/manager/staff roles, permission overrides, business switching, persisted category defaults and module/notification settings with server enforcement.
- Assistance: permission-aware dashboards, grouped daily tasks and demand reports; editable browser voice drafts in English/Hindi/Hinglish; optional configured AI questions. Voice never saves automatically or converts visitor counts into requested units.

Stock's highlighted voice card appears at the top. Voice review can create an unmatched product inline after its name/unit/price are reviewed, then save the product and stock in one confirmation. Ginger also matches `adrak`/`अदरक`; saved unresolved drafts revisit exact matches. See the [voice product fix and QA](docs/voice-product-fix.md).

Money uses integer paise and quantities use thousandths. Financial writes are transactional and retry protected. Demand capture, suggestions, message preparation and order drafts do not change stock or financial ledgers. No messages are sent automatically, and a receipt alone does not count as recovered revenue.

## Limits

This is a tested local application, not a completed commercial deployment. It runs on a persistent single-process Node/SQLite server. Purchase-entry payments are cash; later supplier payments support cash/UPI. Repayments allocate oldest-first unless an invoice is explicitly selected; full cancellation refuses invoices with later repayments. Partial returns, stock-batch expiry, full variant matrices, PostgreSQL/multi-process operation, subscriptions, verified payment settlement, government e-invoicing, OCR/hosted transcription and offline financial synchronization remain future work. Nearby merchant networking is expressly a future phase.

Browser speech support/accuracy depends on the browser and may use its vendor's services. Manual entry remains available. PDFs embed searchable text with shaped Hindi fonts. Public PWA assets have a narrow offline fallback; private records/API responses are excluded. Physical-device, screen-reader, HTTPS installation, live provider and merchant acceptance checks remain separate gates.

## Verification and branches

```powershell
npm run test:locales
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
# In another terminal after building:
npm start -- --port 3002
npm run test:production -- http://127.0.0.1:3002
```

Browser tests use a separate `.data/e2e.sqlite`, private test outbox and `.next-e2e` server on port 3001. Windows uses installed Edge; other platforms need Playwright Chromium installed. Use fictional records and free the test port first. The [V3 QA report](docs/v3-test-report.md) records actual results and rendered evidence; [V2](docs/v2-test-report.md) and [V1](docs/test-report.md) remain historical reports.

`dev` contains active work; `staging` is for reviewed release candidates and `production` for explicitly approved stable releases. Branches do not deploy the app. Feature PRs target `dev`; promotion and hosting are separate actions.

Other project documents: [progress](docs/progress.md), [architecture](docs/architecture.md), [design system](docs/design-system.md), [requirements](docs/requirements.md), [roadmap](docs/roadmap.md), [deployment preparation](docs/deployment.md), [server security boundary](src/lib/server/SECURITY.md), [V2 implementation](docs/v2-implementation.md) and [voice workflow](docs/v2-voice.md).
## Staging preparation

Vercel staging uses a checked HTTPS gateway plus a persistent Node 24 backend. CI, isolated-host configuration, build metadata and staging SEO are prepared; the actual shareable deployment still requires backend hosting and verified email configuration. See [Vercel staging setup](docs/VERCEL_STAGING_SETUP.md). `main` is the approved production baseline; new dev changes require review before production release.

## V5 multilingual experience

The public site and workspace share complete English, Devanagari Hindi and Roman Hinglish resources, saved account preference, localized errors/units/dates, invoice and statement labels, and independent spoken/message language choices. Switching display language preserves open forms and drafts. Reviewed catalogue display names retain canonical merchant records. Supported recorded-total AI questions use full-ledger templates; other questions still need the configured provider. See the [localization guide](docs/LOCALIZATION.md), [audit](docs/v5-localization-audit.md) and [V5 verification](docs/v5-test-report.md).

## V6 Invoice Studio and V7 WhatsApp delivery

Saved invoices, complete Customer Hisaab statements and existing payment receipts share a private server PDF renderer, actual-PDF preview, A4/monochrome/58 mm/80 mm formats and three languages. Owners can configure branding; issued invoice details remain frozen. Customer profiles include full-period running balances, generated/shared document history and current contact editing. VoiceOS prepares saved documents for review.

WhatsApp actions prepare the actual PDF and require recipient confirmation. Native file sharing has a truthful download/chat fallback. The official Cloud API adapter supports configured senders, approved utility document templates, opt-in/opt-out, durable duplicate prevention and signed delivery callbacks. Live Meta delivery and hosted staging remain pending external configuration. See [Invoice Studio](docs/INVOICE-STUDIO.md), [WhatsApp setup](docs/WHATSAPP-DELIVERY.md) and the [V6/V7 test report](docs/v6-v7-test-report.md).
