# DukaanSet Vercel staging

## Current verification

Repository: `Daksh009739/DukaanSet`. `dev` contains the application. `main` was created at the existing `production` baseline (`8a5f6a7ec117cac561ee9ac92ad4ea10f5935455`); no dev code was merged into it. Legacy `production` and `staging` were preserved. The initial baseline has no deployable application; the first production release requires a reviewed merge and separate production infrastructure.

The Vercel project [dukaan-set](https://vercel.com/daksh009739s-projects/dukaan-set) was created after checking for an existing DukaanSet project. It is connected to `Daksh009739/DukaanSet`. Production Branch Tracking is **main**, verified in the saved environment settings; Preview is the non-production environment. Build/install overrides are `npm run build:vercel` / `npm ci --include=dev`, Node is 24.x, and the preset is Other. System build variables are enabled. No application credentials or production variables were copied; existing protection was retained. [Production tracking proof](qa/staging/vercel-production-main.jpg).

**No verified stable staging URL is available yet.** Initial/automatic/external deployment acceptance is pending persistent backend provisioning and hosted email configuration. The project's dashboard/settings URL is not a live demo link.

## Hosting architecture

This app uses synchronous `node:sqlite`, local WAL files and private image blobs inside SQLite. Authenticated page layouts also read the database. A frontend-only API rewrite would leave server-rendered authentication broken. `DATABASE_URL` currently has no adapter.

Vercel therefore acts as an HTTPS gateway for the **entire** application: pages, React Server Component requests, APIs, uploads and static assets. The Next.js app runs on one persistent Node.js 24 backend. This preserves existing transactions, cookies and private uploads. Vercel supports [external rewrites](https://vercel.com/docs/routing/rewrites); `scripts/build-vercel.mjs` generates [Build Output API routing configuration](https://vercel.com/docs/build-output-api/configuration) with no SQLite functions or application secrets. The Vercel framework preset is deliberately **Other**, while the backend remains Next.js.

The backend host must automatically build successful `dev` pushes, keep its database volume across releases, run one application instance, terminate HTTPS, and retain its prior healthy release on a failed build. A VPS needs an equivalent release service. The included Dockerfile is an alternative packaging option; Docker was unavailable locally, so an actual image build is still required. A paid hosting service or volume has not been purchased.

Do not copy the developer's merchant database, local outbox or backups into staging. Start with an empty dedicated database. Try Demo creates isolated fictional accounts, four business categories, stock, customers, sales, payments and DemandPulse scenarios. Existing demo data persists; there is no seed/reset on code deployment. Demo reset remains explicit and restricted to that demo account.

## Vercel configuration

1. Reuse the project prepared for this task; search the account before creating any additional project.
2. Connect the existing GitHub repository through its already authorised Vercel Git integration.
3. Root directory: repository root. Framework: Other. Node: 24.x. Install: `npm ci --include=dev`. Build: `npm run build:vercel`. Output: Build Output API `.vercel/output`, not `.next` or a static export.
4. Settings → Environments → Production → Branch Tracking: **main**. Verify this before allowing any deploy. `dev` remains Preview. Native [Git deployments](https://vercel.com/docs/git) are the deployment mechanism; Actions never runs a second Vercel deployment.
5. Set these [branch-specific Preview variables](https://vercel.com/docs/environment-variables) for `dev` only:

| Variable | Scope and meaning |
| --- | --- |
| `DUKAANSET_BACKEND_ORIGIN` | Actual isolated staging backend HTTPS origin, without path/query |
| `DUKAANSET_PUBLIC_ORIGIN` | Actual stable dev branch HTTPS origin, copied from Vercel |
| `DUKAANSET_DEPLOYMENT_TOKEN` | Private random check token matching the staging backend |

Generate a token with a cryptographic random generator (32 bytes, base64url). Configure it privately on both platforms; never paste it into Git, screenshots or public links. It grants only build-readiness inspection, not merchant API access. Leave database, Resend and OpenAI keys off Vercel. Set separate Production values only when the production release is approved, using a different backend, volume and token.

`VERCEL_ENV`, `VERCEL_GIT_COMMIT_REF` and `VERCEL_GIT_COMMIT_SHA` come from Vercel; expose system variables to the build. Do not replace them with guessed values. The build rejects dev as Production, main as Preview, absent configuration, proxy loops, misplaced application credentials, and a backend at the wrong origin/environment/commit.

`vercel.json` enables only dev/main. Optional feature previews are deliberately deferred: a gateway to the dev backend does not render feature-branch code. Enable them only after provisioning isolated matching backend releases and changing the readiness contract.

## Persistent backend configuration

Use a host with a writable private mounted volume, HTTPS, Node 24 and Git automatic deployment. Native Node commands: install `npm ci --include=dev`; validate `npm run typecheck` and `npm test`; build `npm run build`; start **`npm run start:backend`**. Configure a health check at `/api/health`. Build and runtime must both receive the staging environment and correct site URL because static pages contain the staging label and SEO settings.

| Variable | Staging backend value |
| --- | --- |
| `DUKAANSET_ENV` | `staging` |
| `DUKAANSET_PUBLIC_ORIGIN` | Actual stable Vercel dev branch origin |
| `NEXT_PUBLIC_SITE_URL` | Same public origin, supplied at build time too |
| `AUTH_BASE_URL` | Same public origin for verification/reset/invite links |
| `DUKAANSET_DATA_ROOT` | Absolute private mounted directory with `staging` in its name |
| `DATABASE_PATH` | SQLite file inside that volume; never `/tmp` |
| `DUKAANSET_DEPLOYMENT_TOKEN` | Staging-only check token |
| `AUTH_EMAIL_MODE` | `resend` |
| `AUTH_EMAIL_FROM` | Sender actually verified with the email provider |
| `RESEND_API_KEY` | Server-only email credential configured privately |
| `AI_PROVIDER` | Empty until a real provider is configured |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | Backend only, optional and explicit |
| `PORT` | Platform-supplied port; default 3000 |

Build metadata is written after a successful build. Native hosts may expose `RENDER_GIT_COMMIT`/`RENDER_GIT_BRANCH`; other hosts supply `DUKAANSET_GIT_SHA`/`DUKAANSET_GIT_BRANCH`. Docker builds require those two build arguments, plus `DUKAANSET_ENV` and `NEXT_PUBLIC_SITE_URL`. Use the checked-out full commit SHA, not a made-up revision. Mount the private volume with write access for the container's `node` user. Never pass email, AI or check-token secrets as Docker build arguments.

Startup validates the origin, email setup, volume path and release branch. A path check cannot prove a hosting plan actually supplies persistent storage: verify the mount in the host and prove records survive a normal redeployment before signing off. Staging/prod use distinct services and volumes, not two SQLite files on a shared production mount.

## Authentication, API and upload checks

All browser API calls stay on the public origin; the gateway forwards cookies and responses. Cookies remain HttpOnly/Secure/SameSite=Lax. POST CSRF checks use the explicitly configured HTTPS origin when behind the proxy, rejecting foreign origins and `Sec-Fetch-Site: cross-site`; client `X-Forwarded-*` headers never grant trust. Do not add broad CORS or cookie domains.

Verification, reset and invite links point at the stable staging origin. There is no OAuth callback flow in this app. Hosted file-outbox email is refused. Test a real verified sender with an authorised QA account: registration → verification → onboarding, logout/login, password recovery → reset → old-session rejection, and owner/manager/staff permissions. Unconfigured AI and browser speech limitations stay visible; neither hosted STT nor OCR is supplied by this deployment work. Private photos remain tenant-protected SQLite blobs on the backend volume.

## Automation and quality gates

Normal dev push → native backend build + native Vercel build. Vercel first generates route types, checks TypeScript and runs the unit/API/client/voice/deployment tests. It waits up to ten minutes for the backend's authenticated `/api/deployment` check to report the same full SHA, dev branch, staging environment, public origin and readiness. Only then does it emit gateway output. A missing or mismatched backend fails the deployment; no placeholder site is emitted.

GitHub Actions `Quality / validate` uses Node 24, lockfile installation, TypeScript, tests, Next build and critical browser checks. It has contents-read permission and does not deploy. Require the check on reviewed PRs before merging to main. There is no existing lint configuration to pretend to run. Vercel does not automatically wait for a separate Actions check; the local unit/type checks also run in its build, and the backend's own build must run them before switching releases.

The stable branch domain is the one reported for dev in Vercel, not a guessed project URL. Vercel documents [generated branch URLs](https://vercel.com/docs/deployments/generated-urls). Copy the actual branch alias after a successful deployment; only configure custom DNS after verifying ownership. No `staging.dukaanset.in` ownership was assumed.

Owners can open Settings → Build details to inspect environment, backend branch, SHA, timestamp and actual package version. Anonymous/staff requests are rejected. `/api/health` returns only readiness, with no business records or configuration. Metadata is not exposed through a public version file.

## Partner access and indexing

Keep project deployment protection. Use a branch [Shareable Link](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/sharable-links) supported by the actual plan for approved reviewers. Do not publish bypass tokens or turn off whole-project protection. If a public demo is later desired, configure its exact authorised scope deliberately. Verify both a clean browser and an external partner can access the branch link; a developer's logged-in Vercel browser is insufficient evidence.

Protect the backend origin as well: Vercel protection does not cover direct origin traffic. Retain app authentication and use host-level review access/network controls where available. Do not inject a shared origin credential into all browser requests without reviewing the host's protection mechanism.

Staging responses include `X-Robots-Tag: noindex, nofollow, noarchive`; robots disallows the whole site and sitemap is empty. Production SEO remains unchanged. Robots rules do not protect confidential records. The small bilingual staging banner does not mean all accounts are fictional: Try Demo is the designated fictional workspace.

## Acceptance and failure recovery

After provisioning, run `npm run test:staging -- ACTUAL_HTTPS_ORIGIN` with `DUKAANSET_EXPECTED_COMMIT` set to the full dev SHA. For protected automation, configure a privately stored authorised `VERCEL_AUTOMATION_BYPASS_SECRET`; the check sends it only to the staging origin. The script uses a fresh browser, verifies noindex/robots, 320/360/375/390px homepage layouts, protected routes, health, Secure cookies, an isolated demo, stored stock/invoices, app routes, commit identity, cross-workspace denial, reload and logout. Reports stay in ignored `.local/staging-smoke.json`.

This smoke check does not replace real email delivery, end-to-end sales/voice/photo/DemandPulse checks through the public gateway, physical Android camera/mic tests or partner sharing acceptance. Unit mocks and local builds are not evidence that these hosted integrations work.

Perform the prompt's A/B/C/D tests: initial branch load; a second safe visible dev commit automatically starting both services and updating the **same** branch URL; unchanged main/prod revision and volumes; external reviewer demo plus authenticated inventory/sales. Confirm timestamp, backend SHA and Vercel deployment SHA agree. Record deployment IDs and actual URLs privately, with secrets redacted, before marking the pipeline complete.

Failed Vercel builds keep the earlier successful alias assignment. Inspect native build logs and backend logs for the failing SHA, then fix dev and push. Because all gateway releases target a backend service, reverting a Vercel alias alone **does not roll back the backend application**. Roll back the backend to its matching healthy source first; redeploy the matching gateway. Database migrations are additive; do not reset or blindly downgrade data. Before a schema upgrade run `npm run backup` on the backend volume, verify integrity and keep a protected off-host copy. Restore only with the service stopped and compatible source after explicit approval; no automated destructive rollback/reset exists.

## Remaining access needed

The Vercel project and Git connection are configured and Production tracks main. The blocking resources are an authorised persistent staging backend/volume (existing host or an approved hosting budget), and a configured verified email sender. After they are supplied, finish branch-scoped variables, obtain the actual stable dev alias, configure supported reviewer access and execute A/B/C/D. Production release and custom domain changes remain separate approvals.
