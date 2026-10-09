# DukaanSet

**Apni Dukaan, Sab Set.** A mobile-first, three-language workspace for sales, stock, customer dues and missed demand. V3 adds verified account setup, recovery, staff permissions, configurable modules and DemandPulse to the existing transactional V2 application.

Source: [Daksh009739/DukaanSet](https://github.com/Daksh009739/DukaanSet). See the [V3 implementation and limits](docs/v3-implementation.md), [QA report](docs/v3-test-report.md) and preserved [V3 brief](docs/briefs/v3-master.md).

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

The additive schema migration opens existing version 1/2 databases at version 3 and rejects newer versions. Run `npm run backup` before upgrading; the command creates a SQLite-consistent snapshot under `.data/backups/` and checks integrity/foreign keys. Keep a protected copy elsewhere and restore only with the application stopped and the matching source revision. No scheduled backup service is included.

[.env.example](.env.example) documents server-only configuration. Production account email requires `AUTH_EMAIL_MODE=resend`, a trusted HTTPS `AUTH_BASE_URL`, `AUTH_EMAIL_FROM` and `RESEND_API_KEY`. File delivery is disabled in production. Live delivery through a verified sender still requires an operational test.

The optional read-only AI adapter activates only when `AI_PROVIDER=openai`, `OPENAI_API_KEY` and an explicit `OPENAI_MODEL` are configured. It sends a permitted, reduced business snapshot only after the user asks a question; it cannot write stock, orders, invoices or messages. Unconfigured/provider failures remain visible and the rules-based summaries continue working. Provider retention terms apply. `DATABASE_URL` is still unused; it does not switch the app to PostgreSQL.

## Connected workflows

- Sales: reviewed ordinary invoices, cash/manual UPI/split receipts, credit, private product photos, Unicode invoice/statement PDFs, customer repayments and explicit full cancellation with signed refunds.
- Inventory: products/aliases/descriptive variants, compatible reviewed stock conversions, purchases, stock history, product expiry, waste adjustments and atomic CSV catalogue import with opening stock. CSV import adds products and refuses conflicting SKUs.
- DemandPulse: catalogue or free-text requests, exact product/variant matching, separate quantity/customer/visitor counts, grouped demand, reviewed reorder drafts, actual purchase receipts, consent-aware message preparation, manual contact records and explicit attribution to saved invoice quantities. Cancellation reverses attributed revenue and reopens the remaining demand.
- SaaS: progressive onboarding, account profile/password, one-use verification/reset/invitation links, owner/manager/staff roles, permission overrides, business switching, persisted category defaults and module/notification settings with server enforcement.
- Assistance: permission-aware dashboards, grouped daily tasks and demand reports; editable browser voice drafts in English/Hindi/Hinglish; optional configured AI questions. Voice never saves automatically or converts visitor counts into requested units.

Money uses integer paise and quantities use thousandths. Financial writes are transactional and retry protected. Demand capture, suggestions, message preparation and order drafts do not change stock or financial ledgers. No messages are sent automatically, and a receipt alone does not count as recovered revenue.

## Limits

This is a tested local application, not a completed commercial deployment. It runs on a persistent single-process Node/SQLite server. Supplier purchase payments are cash-only; repayments allocate oldest-first; full cancellation refuses invoices with later repayments. Partial returns, stock-batch expiry, full variant matrices, supplier repayment, PostgreSQL/multi-process operation, subscriptions, verified payment settlement, government e-invoicing, OCR/hosted transcription and offline financial synchronization remain future work. Nearby merchant networking is expressly a future phase.

Browser speech support/accuracy depends on the browser and may use its vendor's services. Manual entry remains available. PDFs rasterize text for Hindi shaping, so text search is unavailable. Public PWA assets have a narrow offline fallback; private records/API responses are excluded. Physical-device, screen-reader, HTTPS installation, live provider and merchant acceptance checks remain separate gates.

## Verification and branches

```powershell
npm run typecheck
npm test
npm run test:e2e
npm run build
# In another terminal after building:
npm start -- --port 3002
npm run test:production -- http://127.0.0.1:3002
```

Browser tests use a separate `.data/e2e.sqlite`, private test outbox and `.next-e2e` server on port 3001. Windows uses installed Edge; other platforms need Playwright Chromium installed. Use fictional records and free the test port first. The [V3 QA report](docs/v3-test-report.md) records actual results and rendered evidence; [V2](docs/v2-test-report.md) and [V1](docs/test-report.md) remain historical reports.

`dev` contains active work; `staging` is for reviewed release candidates and `production` for explicitly approved stable releases. Branches do not deploy the app. This delivery saves V3 on `dev`; promotion and hosting are separate actions.

Other project documents: [progress](docs/progress.md), [architecture](docs/architecture.md), [design system](docs/design-system.md), [requirements](docs/requirements.md), [roadmap](docs/roadmap.md), [deployment preparation](docs/deployment.md), [server security boundary](src/lib/server/SECURITY.md), [V2 implementation](docs/v2-implementation.md) and [voice workflow](docs/v2-voice.md).
