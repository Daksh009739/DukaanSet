# DukaanSet deployment preparation

9 October 2026. The current delivery is a local development application. No domain, hosting account, cloud database or live deployment has been configured by this document. Deployment instructions describe requirements and candidate operation, not a completed release.

## Local runtime

Use Node.js 24+ with native `node:sqlite`, npm and the committed lockfile. From the repository root, install with `npm ci`, create `.env.local` from `.env.example` if needed, then use `npm run dev`. The script binds to `127.0.0.1:3000`; additional Next arguments can choose a port. The default database is `.data/dukaanset.sqlite`, created by the server.

The package scripts use `scripts/run.mjs` to require Node 24+. `DUKAANSET_NODE` can select a runtime executable. `DUKAANSET_BUILD_DIR` selects the Next build directory; browser tests use `.next-e2e` to avoid sharing the normal development build. The backend is a Node runtime; an Edge-only runtime cannot execute this native SQLite implementation.

| Variable | Current behavior | Deployment implication |
| --- | --- | --- |
| `DATABASE_PATH` | SQLite file path, default `.data/dukaanset.sqlite` | Server-controlled writable persistent storage; never derive it from request input |
| `NEXT_PUBLIC_SITE_URL` | Public metadata, canonical and sitemap base URL | Set the approved public HTTPS URL; this variable does not authorize request origins |
| `DUKAANSET_NODE` | Optional executable used by the script runner | Must point to Node 24+ when set |
| `DUKAANSET_BUILD_DIR` | Next output directory, default `.next` | Keep builds outside business data; separate concurrent test/build instances |
| `OPENAI_API_KEY` | Unused future AI boundary | Not required locally; no live adapter is activated by setting it |
| `DATABASE_URL` | Unused future managed database boundary | Does not replace SQLite; a PostgreSQL adapter and migration must be built first |
| `NODE_ENV` | Managed by Next.js commands | Production responses always use Secure session cookies |

Changing `DATABASE_PATH` opens a different database; it does not migrate records. Git tracks source, not the database. Stop and retain the original data before any planned storage migration.

## Candidate build and runtime

```powershell
npm ci
npm run typecheck
npm test
npm run build
```

After a successful build, `npm start` runs the production bundle on loopback. A production HTTP session is unsupported: cookies are HttpOnly, SameSite=Lax and Secure for every production response. For authenticated use, the final trusted ingress must serve HTTPS and present the correct public scheme/Host to Next.js. These requirements also apply to a future staging service; production-mode staging builds need HTTPS.

The request boundary requires exact matching Origin on POST and rejects cross-site fetches. It uses the validated incoming Host to account for Next's loopback normalization, and ignores forwarded-host headers. A trusted ingress must reject arbitrary public hosts, preserve the allowed public Host and correctly handle the HTTPS scheme. Do not make arbitrary client proxy headers trusted. Test actual browser login, logout, CSRF rejection and Secure cookies through that final ingress before release. Detailed current behavior is documented in [the server security boundary](../src/lib/server/SECURITY.md).

The application currently uses a single local process and aggregate state reads. An ephemeral/serverless filesystem cannot safely host this SQLite database. Do not run a container without a persistent volume or assume a deploy package contains current merchant records. A public pilot needs explicit authorization and an operational design review; a commercial multi-process release needs the PostgreSQL and concurrency work below.

## Storage, backup and upgrade

The schema bootstraps version 1, enables foreign keys, a five-second busy timeout and WAL. This is not a tested sequence of forward migrations. Rejecting a newer schema prevents some accidental downgrade misuse; it is not a rollback strategy.

Protect database files and backups as private records. Exclude `.data`, SQLite files, WAL/journal files, secrets and browser test artifacts from source control and deployment bundles. A live raw-file copy may omit committed WAL data; use an operationally reviewed SQLite-consistent backup process or a stopped/checkpointed database. No automated backup or restore service is implemented. Define retention, encryption/access, backup ownership and a successful restore drill before relying on persistent production data.

For PostgreSQL, implement a repository adapter, normalized invoice/purchase lines and appropriate tenant-qualified constraints; migrate IDs, historical totals, signed DTO semantics and audit history without recreating the merchant database. Run versioned migrations and recovery rehearsals on realistic snapshots. Verify transaction rollback, stock contention, invoice numbering and idempotency with multiple processes. Merely setting `DATABASE_URL` cannot provide these behaviors.

## Branch and release policy

| Branch | Purpose | Promotion evidence |
| --- | --- | --- |
| `dev` | Active implementation | Source review and relevant automated checks |
| `staging` | Reviewed release candidate | Representative end-to-end, phone/language, accessibility and security checks; storage/upgrade rehearsal |
| `production` | Approved stable release source | Remaining operational, legal and product gates met; deliberate release authorization |

Promote `dev` to `staging`, then `staging` to `production`. Branches are source-control boundaries; no automatic deployment pipeline has been configured. Do not label the current vertical slice commercially ready simply because the three branches exist or a bundle builds.

## Remaining release gates

- PostgreSQL adapter, sequential migrations, tested concurrency and storage capacity appropriate to the deployment.
- HTTPS/trusted ingress and correct origin/cookie behavior; distributed rate limits, operational logging/monitoring and incident recovery.
- Account recovery/verification, staff permissions if offered, privacy retention/deletion and protected export/backup practices.
- Merchant acceptance of billing, supplier cash-only limits, cancellation, unit behavior and closing; accounting/tax/privacy and legal-copy review for intended use.
- Completed responsive/language/keyboard/accessibility checks, performance measurements and SEO canonical validation on the approved domain.
- PWA installation and upgrade testing on HTTPS; no sensitive API/HTML caching. Offline financial sync and Android store publication require separate implementation and review.
- Configured and tested real adapters before activating AI, OCR/voice, messaging, payment verification, subscriptions or government e-invoicing.

Final local validation passed the production build, 26 backend/client tests, 7 browser scenarios and 7 local production smoke checks. See the [delivery QA report](test-report.md) for evidence and remaining device/HTTPS/operational limits.
