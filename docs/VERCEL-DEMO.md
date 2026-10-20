# Temporary Vercel demo

The `yatrikjunkies-1745/dukaanset-dev` project publishes `dev` at `https://dukaanset-dev.vercel.app`. Its Vercel Production environment tracks `dev`, while the application itself remains explicitly labelled **staging / demo only**. No custom domain or paid plan is required for this demonstration. This is not a production merchant-data deployment.

The old Hostinger staging address stopped serving the application. A proxy to it cannot provide a working preview. The opt-in Vercel adapter therefore runs the existing Next.js application directly, retaining the existing SQLite Store, financial services, permissions and UI. Each demo session has its own compressed SQLite snapshot in the project's private Upstash Redis store. SQLite lives in memory during a request; no Vercel local file is treated as persistent storage. Images, document captures and PDFs already use database BLOBs and travel with the session snapshot.

The free `dukaanset-demo` Redis resource is in Mumbai with eviction disabled. Vercel functions also run in `bom1`. Only this DukaanSet project is connected. Server-side Redis credentials are created by the marketplace integration, marked sensitive, and never included in public variables or response payloads. No existing merchant database is uploaded, migrated or overwritten.

## Required configuration

Set `DUKAANSET_VERCEL_DEMO=1`, `DUKAANSET_ENV=staging`, `DUKAANSET_STAGING_DEMO_ONLY=1`, `NEXT_PUBLIC_DUKAANSET_DEMO_ONLY=1`, `AUTH_EMAIL_MODE=unavailable` and `DUKAANSET_GIT_BRANCH=dev`. `NEXT_PUBLIC_SITE_URL`, `AUTH_BASE_URL` and `DUKAANSET_PUBLIC_ORIGIN` must all equal the temporary public origin above. Connect `KV_REST_API_URL` and `KV_REST_API_TOKEN` through the private Upstash integration; the equivalent `UPSTASH_REDIS_REST_*` names are supported too. Do not configure `DATABASE_PATH`, a persistent backend data root or Hostinger mode on this project.

Use Next.js, Node 24.x and `npm run build:vercel`; source `vercel.json` selects the native Next.js deployment. The separate `vercel.gateway.json` preserves the previous persistent-backend proxy configuration for explicit CLI use with `vercel --local-config vercel.gateway.json`. The default SQLite runtime still refuses accidental Vercel execution; only the guarded demo adapter supplies a request-specific Store.

## Integrity and isolation

Snapshot keys use SHA-256 hashes of high-entropy HttpOnly session tokens. Every restored request still passes the existing session, role and business-membership checks. Real-account authentication is refused. Server-rendered protected pages use the same shared session; React cache deduplicates that lookup only within a render pass.

Reads use the Redis primary. Atomic compare-and-set writes accept a snapshot only when the previous value still matches. A competing financial request receives a conflict and must retry; it cannot silently overwrite another invoice or payment. Existing invoice idempotency remains in the shared database. Safe read requests can retry against a newer snapshot. Storage failures return an unavailable response, not an empty replacement database. Expired/missing sessions require a new demo.

Sessions expire after seven days. Snapshots have a seven-day TTL after their latest successful write, with bounded compressed and expanded sizes. This mode is for fictional demonstration records. Registration, hosted email and unconfigured external AI, voice cloning, OCR, messaging and payment-provider integrations remain unavailable. In-process background workers do not run on Vercel. A real business deployment still needs a supported durable backend and configured providers.

## Regression coverage

The adapter tests cover invalid hosting settings, credential endpoint restrictions, isolated snapshot restoration, real-session rejection, server-rendered authentication and logout, Hindi locale persistence, tenant isolation, invoice retry idempotency, stock accuracy, unchanged historical payments, competing financial writes, storage conflicts, corrupted snapshots and Redis transport failures. Compiled browser checks additionally exercise the real free Redis store, multilingual demo entry, responsive layouts, PDF generation and session/stock retention after stopping and restarting the Node server. Live deployment acceptance must verify the deployed SHA and repeat financial, PDF, isolation and redeployment-retention checks.

The full backend suite passed 447 tests with zero failures or skips using two workers in the isolated checkout. TypeScript, source lint and translation checks passed. The compiled demonstration passed English, Hindi and Hinglish login, nine responsive authentication layouts, zero scoped accessibility violations, a confirmed 100-rupee invoice, three-language PDFs, unchanged financial history during document generation and exact session/stock/invoice retention after restarting the server. A separate lost-acknowledgement regression verifies that a committed snapshot followed by a network failure cannot create another invoice or payment when the same request is retried.
