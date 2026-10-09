# DukaanSet deployment preparation

9 October 2026. V3 is a local Node/SQLite delivery. No live hosting, domain, production email sender, paid AI model or cloud database has been configured as part of this release. The following describes the operating requirements.

## Runtime and configuration

Use Node.js 24+ with native `node:sqlite`, npm and the committed lockfile. The Node runtime is required; an Edge-only runtime cannot execute this database. Install with `npm ci`, configure private server environment variables, then run the checks below.

| Variable | Behavior |
| --- | --- |
| `DATABASE_PATH` | Private persistent SQLite path; default `.data/dukaanset.sqlite`. Changing it opens another database and does not move existing records. |
| `NEXT_PUBLIC_SITE_URL` | Approved public metadata/canonical origin; does not authorize request origins. |
| `AUTH_BASE_URL` | Trusted origin for verification, reset and invitation links. Set the approved HTTPS origin in production; never derive links from a request Host. |
| `AUTH_EMAIL_MODE` | `file` for local development, `resend` for configured delivery. Production refuses file delivery. |
| `AUTH_EMAIL_FROM`, `RESEND_API_KEY` | Server-only verified sender and provider key, required for Resend mode. |
| `AUTH_MAIL_DIRECTORY` | Optional private development outbox. Default `${DATABASE_PATH}.mail`; paths inside `public/` are refused. Never publish this directory. |
| `AI_PROVIDER` | Set exactly `openai` to opt into the read-only adapter. Empty/unrecognized values leave it unavailable. |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | Explicit server credentials and model ID. No model default is guessed and no call occurs before a user asks. |
| `DUKAANSET_NODE` | Optional Node 24+ executable selected by the runner. |
| `DUKAANSET_BUILD_DIR` | Next output directory; use separate directories for concurrent dev/test builds. |
| `DATABASE_URL` | Reserved, currently unused. No PostgreSQL adapter is implemented. |
| `NODE_ENV` | Managed by Next commands. Production cookies always carry `Secure`. |

Keep secrets out of `NEXT_PUBLIC_*`, Git, screenshots and logs. Restrict the database, WAL/journal files, backups, photos and outbox to the service owner. Windows file-mode outbox permissions also depend on the containing directory ACL; provision a private directory.

## Build, HTTPS and request boundary

```powershell
npm ci
npm run typecheck
npm test
npm run test:e2e
npm run build
npm start
```

Production account sessions require HTTPS. Cookies are HttpOnly, SameSite=Lax and Secure. The trusted ingress must restrict accepted public hosts, preserve the approved Host and present the correct scheme. POST requires exact matching Origin and rejects cross-site fetches; arbitrary forwarded-host headers are ignored. Validate login, logout, token links, CSRF rejection and Secure cookies through the actual final ingress. See [server boundaries](../src/lib/server/SECURITY.md).

Sensitive pages use no-referrer behavior; Next development URL logging excludes token-link routes. GET on a verification/reset/invitation link does not consume it: the recipient explicitly confirms through POST. Email confirmation/reset are real one-use, hashed, expiring tokens, rather than simulated OTP. Password reset revokes all sessions. Legacy accounts remain usable without a false verified marker.

Resend mode uses the official server [send-email API](https://resend.com/docs/api-reference/emails/send-email). Verify the sender/domain and run real delivery, expiry, resend and failure tests before offering registration publicly. A provider error does not claim delivery; an account created before a failed send remains unverified and can request another link. Recovery responses avoid exposing whether an email exists, but provider-dependent timing is not normalized. A durable queued mailer and timing review remain public-scale hardening work, consistent with [OWASP recovery guidance](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html).

## Storage, upgrade and recovery

The application uses one persistent Node process, SQLite WAL, foreign keys and a five-second busy timeout. Ephemeral/serverless filesystems and independent replicas do not provide safe persistence for this design. Use an owned persistent volume and operational monitoring; large commercial/multi-process operation needs a repository adapter and concurrency work.

Run `npm run backup` **before** opening a new application revision on existing data. It creates a SQLite-consistent snapshot with integrity and foreign-key checks. V3 migrates version 1→2→3 additively and rejects a schema newer than supported. The V3 upgrade was rehearsed on a pre-V3 snapshot and original columns/values in 17 tables were unchanged; see [migration evidence](qa/v3/migration-verification.json).

Do not downgrade application code against an upgraded live database. Stop the app, retain the upgraded data separately and restore the protected pre-upgrade snapshot with the matching older source revision if a rollback is required. Practice a restore, define ownership/retention/access and keep a protected off-machine copy. No scheduled backup or restore service is included. Raw copying a live SQLite file may miss WAL data.

For PostgreSQL, implement a storage adapter and tenant-qualified constraints, normalized line references, controlled migration and recovery rehearsal. Verify simultaneous stock writes, numbering and idempotency across processes. Setting `DATABASE_URL` alone has no effect.

## Optional AI and voice

The configured assistant calls the [Responses API](https://developers.openai.com/api/docs/guides/text) using an explicit model, a reduced permission-scoped snapshot and `store:false`. It sends names and business totals that the caller may read, excludes phones, email, credentials and raw tokens, and has no write tools. Review the provider's [data controls](https://developers.openai.com/api/docs/guides/your-data): `store:false` does not promise zero provider retention. Assess consent, model availability, pricing and applicable data controls before enabling it for real merchant records.

Failures or incomplete responses show an unavailable state; saved-record summaries remain usable. This delivery tested request/redaction/failure behavior with mocked fetches, not paid model accuracy. Generated advice must be checked against records. Speech uses deliberate browser recognition with editable review and manual fallback; raw audio/transcripts are not stored by DukaanSet. Browser vendor processing and actual microphone accuracy require device review. No hosted STT/OCR adapter is included.

## Release gates and branch policy

`dev` is active implementation, `staging` a reviewed candidate and `production` explicitly approved stable source. Promotion is deliberate; no automatic deployment pipeline has been configured.

Before public operation, complete the actual HTTPS/host/provider checks, persistent backup/restore drill, distributed throttles and monitoring, privacy retention/deletion/export procedures, device/screen-reader/merchant acceptance and legal/tax review. Current throttles are process-local and reset on restart. Invitation currently requires an already registered non-demo recipient; ownership transfer is deliberately separate. Shared businesses cannot use demo reset.

PWA caches only selected public assets and an offline fallback. Real HTTPS installation/upgrade and Android distribution are unverified. Financial actions require online server confirmation; offline financial sync, subscriptions, settlement verification and nearby merchant networking remain future work. Final local evidence is in the [V3 QA report](v3-test-report.md).
# Vercel staging

The repository now includes a Vercel gateway and persistent Node backend packaging. Read [the staging setup guide](VERCEL_STAGING_SETUP.md) before importing this project. The gateway forwards the whole app to an isolated persistent backend; direct SQLite deployment into Vercel Functions is rejected. A successful local build is not a verified hosted deployment.
