# Temporary Hostinger staging

This opt-in package deploys the existing Next.js application from dev to an included `hostingersite.com` address. It does not change production, use a custom domain, copy local merchant data, or connect an unsupported external database.

hPanel settings: GitHub repository `Daksh009739/DukaanSet`, branch `dev`, Node 24.x, preset Other, root `./`, npm build command `npm run build`, output `.hostinger`, entry `start.js`. The standard build remains unchanged unless `DUKAANSET_HOSTINGER_STAGING=1`; that explicit environment additionally packages the traced standalone server with public/static assets and build metadata.

Configure `DUKAANSET_ENV=staging`, `DUKAANSET_HOSTINGER_STAGING=1`, and matching HTTPS values for `NEXT_PUBLIC_SITE_URL`, `DUKAANSET_PUBLIC_ORIGIN` and `AUTH_BASE_URL`. `DUKAANSET_GIT_BRANCH=dev` must match the checkout; the build records its full Git SHA. Configure a private random `DUKAANSET_DEPLOYMENT_TOKEN` in the hosting environment, never in Git. Application/provider secrets belong on the backend only.

The startup derives its SQLite path from the actual hosting account home, inside `.dukaanset-staging/<temporary-hostname>/`. It does not guess a hosting username and refuses public/build/temporary directories or a conflicting database path. It validates the environment and build before starting the same Next.js server. Data stays outside Hostinger's replaceable `hbuilds` and `public_html` paths; a successful live redeploy/persistence check is still required to establish the platform's actual behavior.

## Approved demo-only staging

The user explicitly approved temporary staging through Try Demo while external credentials remain unavailable. Set `DUKAANSET_STAGING_DEMO_ONLY=1`, `NEXT_PUBLIC_DUKAANSET_DEMO_ONLY=1` and `AUTH_EMAIL_MODE=unavailable`. This exception is limited to staging, requires a visible demo-only label, and does not relax normal hosted registration's verified-email requirement. Registration, real-account login, password reset, invitation and verification endpoints are refused. Existing non-demo session cookies are rejected by the shared authentication boundary. Demo workspaces continue to use the existing isolated records, permissions and deterministic financial operations.

The public authentication screens display Try Demo and the limitation in English, Hindi and Hinglish instead of offering inactive registration forms. Unconfigured AI, voice-cloning, messaging and payment-provider integrations remain unavailable; no test provider credentials, provider fixtures or fabricated payment verification are deployed.

Do not call this a production release. Verify HTTPS, assets, noindex, session cookies, demo billing/stock/customer/PDF/voice flows, business isolation and data persistence across an actual redeploy before reporting a successful staging deployment. hPanel reported that the available Business plans expire on 19 October 2026; provisioning staging does not renew them.

## Quality verification

The new backend tests cover repeatable private storage paths, invalid hosting roots, staging-only email exceptions, blocked real authentication/session access and unchanged real users while a fictional demo works. The complete backend suite passed 437 tests. TypeScript, lint and translation parity passed before hosting build verification. The broad responsive-module audit now paces each viewport against the existing per-user request quota and reports any 429 responses explicitly; production request limits are unchanged.
