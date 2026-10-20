# Normal account deployment from dev

The current request supersedes the temporary demo-only approval: publish the existing application from `dev`, with normal login, registration, empty new business workspaces and the existing financial workflows. Do not hide a demo-only runtime behind working-looking account forms. Do not migrate fictional demo snapshots into real accounts or upload the developer's local merchant database.

## Current verified dependencies

On 20 October 2026, `https://dukaanset-dev.vercel.app/api/health` returned 200, but that deployment still runs the deliberately isolated demo adapter described in [VERCEL-DEMO.md](VERCEL-DEMO.md). The old `green-shark-556143.hostingersite.com/api/health` returned 404. The signed-in Hostinger Websites page shows both Business plans expired, including the plan containing that backend. Their dashboard/start controls are disabled.

No live authentication email credentials were found in the workspace or inherited environment. Local development uses a private file outbox, not email delivery. No live AI, hosted speech, cloning, weather, messaging or payment-provider credentials were found either. Implemented provider adapters must continue to report their actual availability; they cannot be made functional by renaming the environment. The free Redis integration is for expiring isolated demonstrations and is not the application database for real accounts.

## Prepared release configuration

Reuse the existing persistent Node.js 24/SQLite backend and whole-application Vercel gateway. This keeps server-rendered authentication, APIs, uploads, financial transactions, PDFs and durable workers together. A `DATABASE_URL` alone cannot activate a database adapter that does not exist. Vercel's ephemeral local filesystem cannot retain this SQLite database.

Normal account releases default to `main`. The explicitly requested live `dev` release is now supported by setting `DUKAANSET_RELEASE_BRANCH=dev` on **both** the backend and gateway. The actual checked-out branch and full Git SHA must still match the backend readiness response. No merge into `main` is needed. Other feature branches remain rejected.

Backend build and runtime:

```dotenv
DUKAANSET_ENV=production
DUKAANSET_RELEASE_BRANCH=dev
DUKAANSET_PUBLIC_ORIGIN=https://dukaanset-dev.vercel.app
NEXT_PUBLIC_SITE_URL=https://dukaanset-dev.vercel.app
AUTH_BASE_URL=https://dukaanset-dev.vercel.app
AUTH_EMAIL_MODE=resend
```

Configure `DUKAANSET_DATA_ROOT` as the actual private persistent mounted directory and `DATABASE_PATH` inside it, outside the code/build and temporary directories. Set `AUTH_EMAIL_FROM` to a verified sender and `RESEND_API_KEY` in the server secret manager. Configure a new dedicated `DUKAANSET_DEPLOYMENT_TOKEN` on the backend and gateway. Use the hosting platform's actual Git SHA/branch, not stale release values. Never publish secrets or provider credentials through `NEXT_PUBLIC_*`.

Remove `DUKAANSET_VERCEL_DEMO`, `DUKAANSET_STAGING_DEMO_ONLY` and `NEXT_PUBLIC_DUKAANSET_DEMO_ONLY`. Production rejects those flags. No staging banner is rendered in the production environment, and the existing auth component restores its normal forms when the public demo-only flag is absent. Rebuild the frontend after changing these build-time settings.

Start with `npm run start:backend`; it validates the private data path, email settings and build identity before starting the existing server. It runs the existing closing worker, and the normal persistent backend also runs the existing media and configured UPI workers. Keep one application instance with the current SQLite architecture. Restore/migrate existing merchant records only as a separately authorised, backed-up operation.

Vercel gateway:

```dotenv
DUKAANSET_ENV=production
DUKAANSET_RELEASE_BRANCH=dev
DUKAANSET_PUBLIC_ORIGIN=https://dukaanset-dev.vercel.app
```

Set `DUKAANSET_BACKEND_ORIGIN` to the actual active backend HTTPS origin and the matching private readiness token. Keep Production branch tracking at `dev`. Use the gateway settings from `vercel.gateway.json` (framework Other, build `npm run build:vercel`) for the cutover; replace the native demo `vercel.json` only once the matching backend is ready. Remove the demo flags and unused demo storage connection from the gateway configuration. Keep application/provider keys only on the backend. The gateway does not require or publish the Redis demo data.

The gateway build will refuse to publish until the backend has the same SHA, branch, production environment and public origin. This allows the prior site to remain available if provisioning or a build fails. Changing code or removing a visible label is not evidence of live registration or provider success.

## Acceptance before announcing completion

Use a new, explicitly identified QA account and real approved test inbox, separate from merchant records. Verify delivered registration, one-use email verification, logout/login on a new browser, password recovery, onboarding and an empty new business. Record billing, stock, customer, udhaar, payment, audit and PDF checks; confirm exact records survive a server restart and a real deployment. Exercise cross-business rejection, duplicate invoice retries and provider callback idempotency. Verify genuine provider connections separately; never send real reminders or charge payments as an incidental smoke test.

Open login, registration and authenticated pages in English, Hindi and Hinglish. Confirm no staging/demo-only banner appears for a real account, no sample financial records appear in a new account, and an explicitly chosen optional demo remains labelled if retained. Check the microphone on desktop and Android with actual device permission. Do not report A–Z parity while a required service or live acceptance check remains missing.

## Source verification

The release-configuration change passed 23 deployment, Hostinger and Redis-adapter regression tests, TypeScript checking, source/localisation lint and `git diff --check`. The added cases verify explicit live-dev opt-in on both hosts, rejection of incorrect branches and SHA mismatches, rejection of leftover demo flags, required hosted email and preservation of the persistent-host requirement. These are source checks, not successful live normal-account acceptance. The public site's demo-only configuration has not been silently disabled.
