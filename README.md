# DukaanSet

DukaanSet — **Apni Dukaan, Sab Set.** — is a mobile-first workspace for bills, stock and customer payments. This repository contains a runnable development vertical slice with a real local backend; the full commercial product remains staged work.

Repository: [Daksh009739/DukaanSet](https://github.com/Daksh009739/DukaanSet).

## Run locally

Use **Node.js 24 or newer** and npm. Native `node:sqlite` is required; no separate database server or paid provider is needed for the local slice. Run these commands from the repository root in PowerShell:

```powershell
node --version
npm ci
if (-not (Test-Path -LiteralPath .env.local)) {
  Copy-Item -LiteralPath .env.example -Destination .env.local
}
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). Choose the clearly labelled demo to explore fictional grocery, hardware, vegetable and Fashion shops, or register a real local account to start with an empty business. Registration asks for name, email, a password of at least 10 characters, business name, category and language. Email verification and password recovery are not implemented.

The development server binds to `127.0.0.1`. To choose another local port, use `npm run dev -- --port 3002`. The script runner checks the Node version; on Windows it can find Node 24+ at `C:\Program Files\nodejs\node.exe`. If another Node executable must be selected, set `DUKAANSET_NODE` to its absolute path before running a script.

## Persistence and configuration

The server creates `.data/dukaanset.sqlite` on first use, with SQLite WAL journaling. Accounts, sessions and business records survive ordinary refreshes and server restarts while that database remains in place. `DATABASE_PATH` selects another server-side path; keep it on writable, durable local storage. This file contains private business records and password hashes. It is ignored by Git, so pushing code does **not** back up merchant data.

[.env.example](.env.example) documents configuration without credentials. `NEXT_PUBLIC_SITE_URL` controls public metadata/canonical URLs. `OPENAI_API_KEY` and `DATABASE_URL` are future integration boundaries: setting them does not activate an AI provider or a PostgreSQL adapter. Never place secrets in `NEXT_PUBLIC_*` variables or commit `.env.local`, database files, WAL/journal files, backups, dependency folders or generated output.

## Current scope

The code connects owner account/session access, business switching, English/Hindi/Hinglish app copy, category dashboards, products and stock movements, customers and dues, ordinary invoices, cash/manual UPI/split receipts, private item photos, downloadable invoice/customer-statement PDFs, partial customer repayments, supplier stock receipts, expenses, daily tasks, daily cash closing, product editing/aliases, reviewed voice stock batches, demo reset, read-only business summaries, print views and stock CSV/business JSON export. Financial totals are calculated on the server using integer paise and quantities in thousandths; related invoice/payment/stock writes are transactional.

The slice has deliberate limits: supplier purchase payments are cash-only; customer repayments allocate oldest-first; full cancellation refuses invoices with later repayments; expiry belongs to a product rather than a stock batch; access is owner-only. Manual UPI entries are merchant records, not provider-verified settlement. The invoice is not a government-registered e-invoice. Advanced tax/accounting, staff roles, recovery/OTP, partial returns, full batch/variant matrices, transactional CSV import, automated messaging, OCR, hosted transcription and live AI, subscriptions and offline financial synchronization remain future work.

Original replaceable brand assets, public marketing pages, metadata/sitemap/robots, a manifest and a narrow offline fallback are included. Only selected public assets are cached; authenticated records and API responses are excluded. Installation, accessibility, responsive coverage and production operation require their own validation. See [progress](docs/progress.md) for implementation status and [requirements](docs/requirements.md) for the full brief.

## V2 notes and private backups

See [implementation and limits](docs/v2-implementation.md), [voice workflow](docs/v2-voice.md) and [audit](docs/v2-audit.md). New Sale keeps product, quantity, customer and payment together; only **Save Sale** writes the ledgers. Voice input always requires an editable review and explicit stock confirmation. Browser speech recognition may use the vendor’s servers, depends on browser support and has a manual fallback. The read-only business summary uses rules over saved records; an LLM is not connected.

The additive schema migration runs automatically when the database opens. Before future upgrades use `npm run backup` to create a SQLite-consistent snapshot under the ignored `.data/backups/` directory. It checks SQLite integrity and foreign keys. Use `npm run backup -- path/to/database.sqlite` for another source, keep a protected copy away from the working machine, and stop the application before restoring it with the matching source revision. A manually verified current V2 local snapshot was created during this delivery; this is not an automatic backup service or a pre-V2 snapshot.

Invoice and statement PDFs are actual paginated PDFs with locally rendered Unicode fonts and protected item photos. Text is rasterized for Hindi shaping, so PDF text search is unavailable. Native file sharing requires browser support; the user prepares the file and chooses its destination explicitly. No invoice access URL is published or sent automatically.

## Development checks

```powershell
npm run typecheck
npm test
npm run build
npm run test:e2e
```

The V2 verification results are recorded in the [V2 QA report](docs/v2-test-report.md). Unit/API tests cover transaction and tenant boundaries, migrations, retries, split refunds, private photos, full-ledger aggregates and voice parsing. Browser checks exercise real workflows, phone layouts, PDF files and microphone failures. The [V1 QA report](docs/test-report.md) remains historical evidence.

Playwright starts its own development server at `http://127.0.0.1:3001`, uses `.data/e2e.sqlite` and `.next-e2e`, and requires port 3001 to be free. Windows runs use an installed Microsoft Edge. On other platforms install the Playwright browser first with `npx playwright install chromium`. Use fictional test records and a separate database. The default runner starts a fresh managed server for each spec, isolating browser mocks and process-local rate counters without changing production throttles. Explicit file arguments run together. Reports/traces/screenshots are ignored by Git and contain fictional test records.

`npm run build` validates the production bundle. `npm start` runs that bundle after a build; authenticated production operation requires HTTPS because production cookies always carry `Secure`. See [deployment preparation](docs/deployment.md) before operating it outside local development. No live deployment is part of this delivery.

## Branch workflow

- `dev`: active development and new work.
- `staging`: reviewed candidate changes for testing before release.
- `production`: code approved for a stable release after its gates are met.

Promote reviewed changes from `dev` to `staging`, then from `staging` to `production`.
The local workspace uses `dev`. A branch name or Git push does not deploy an application or prove production readiness. Keep code, documentation and project assets in this repository; commit and push reviewed work to preserve source history, while retaining separate protected backups of local business data.

## Project documents

- [Original master brief](docs/master-brief.md): the complete user-provided product specification.
- [Competitor research](docs/research.md): official sources, observed features and merchant validation questions.
- [Requirements](docs/requirements.md): full scope and acceptance contracts.
- [Architecture](docs/architecture.md): storage, transactions, money/quantity and provider boundaries.
- [Design system](docs/design-system.md): shared identity, tokens, components and phone behavior.
- [Roadmap](docs/roadmap.md): implementation phases and release gates.
- [Progress](docs/progress.md): delivered, limited and remaining work.
- [V2 QA report](docs/v2-test-report.md): final commands, tested workflows and rendered evidence; [V1 QA](docs/test-report.md) records the earlier baseline.
- [Deployment preparation](docs/deployment.md): local persistence and future operation requirements.
- [Server security boundary](src/lib/server/SECURITY.md): cookies, trusted Host/origin and runtime storage.
