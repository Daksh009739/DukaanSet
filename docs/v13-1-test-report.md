# DukaanSet V13.1 QA

Validation uses private fictional shops and the existing business services. The supplied image is the dashboard reference; original storefront artwork and real record values replace its sample illustration/data.

## Automated verification

| Check | Result |
| --- | --- |
| Node 24 fresh dependency install | Passed; npm audit reported zero vulnerabilities |
| Unit/business/security checks | 193 passed |
| Typecheck and source lint | Passed |
| English/Hindi/Hinglish parity | 2,117 keys per language; 100% key/variable parity; zero hardcoded visible strings |
| Browser regression cases | 75 distinct cases passed across 13 suites |
| Isolated production build | Passed with the default Next.js build |
| Production public/security/PWA smoke | Seven checks passed |
| Compiled conversational billing/shared stock | Passed |
| Compiled counted close, translated PDFs and real closing timer | Passed |
| Compiled V13 stock → customer → cash sale → invoice PDF → VoiceOS → closing review → media worker | Passed |

The browser suites cover onboarding/login/logout, business switching, tenant isolation, CSRF, stock adjustments, sales, refunds, split payments, lost acknowledgements, customer hisaab, historical invoices, PDFs, WhatsApp confirmation boundaries, permissions, DemandPulse and CSV imports. Voice capture lifecycle uses browser speech mocks; production demonstrations use typed commands through the real interpreter. Physical microphones and external speech/provider availability are device-dependent.

The new checks exercise complete chart/product aggregates beyond the 1,000-row display cap, full-history invoice search, topbar VoiceOS, collapsed navigation accessibility, media rights/quality, bounded source URLs, retries/leases, concurrent processing, stale identities, quota enforcement, merchant overrides, private upload validation and tenant separation. Image operations leave financial records unchanged.

Initial regressions exposed header actions before business hydration, a mobile selector hidden by the compact header, an undersized profile button and an unlabelled mobile search button. Loading guards, the visible mobile business menu and accessible control labels corrected them; affected cases passed on rerun. A production build attempted during browser tests exhausted Windows resources; the isolated bounded-worker retry passed. No dependency/TLS weakening was introduced.

## Rendered evidence

The shared design was rendered on 16 major routes at desktop 1,672px and mobile 390px. Dashboard layout checks include widths 320, 360, 375, 390, 412, 430, 768, 1,024, 1,440, 1,672 and 1,920. English, Hindi and Hinglish phone screenshots are retained. Automated accessibility checks cover the dashboard, sidebar, sales/customer flows, VoiceOS and closing. Render checks found no document overflow or browser runtime errors.

Evidence is in [QA assets](qa/v13/). `approved-reference.png` is the supplied 1,672×941 reference. `historical-before-dashboard.png` is the existing V9/V10 QA baseline retained in this repository, rather than a newly captured V12 screenshot. `demo-dashboard-desktop.png` shows current fictional demo records; its visible demo banner adds height. The dark sidebar, compact header, pastel metrics, operational panel proportions and recent-record grid follow the reference. Artwork, actual values, localized text and truthful record-based insight labels differ intentionally. No numerical pixel similarity or pixel-perfect claim is made.

The compiled 1,672×941 screenshot and 390px phone capture use a private verified Anand Kirana QA shop. Four voice confirmations create Pyaz, Maggi Masala Noodles, Coca-Cola 500ml and Water Bottle 1L with exact quantities/rates. A confirmed Heer customer cash bill sells 5kg Pyaz for ₹500, leaves 5kg stock, ₹500 collections and zero customer dues, and produces a real immutable PDF. A voice sales report reads that record; a closing review leaves the session open. The persistent media worker resolves the licensed onion photo and reviewable packaging suggestions without changing those quantities or invoices.

This compiled local sample measured DOM content loaded at 119ms, load at 200ms and the populated dashboard at 519ms, with 49,309 transferred resource bytes. The browser had warm assets from earlier steps. These are local navigation measurements, not a Lighthouse score or a prediction of internet/mobile latency. Screenshots wait for actual business hydration. `compiled-source-verification.json` compares runtime assets/source with the isolated build checkout.

## Media and deployment limits

Live Commons lookup produced a licensed automatic Pyaz thumbnail and reviewable suggestions for Maggi Masala, Coca-Cola 500ml and Water Bottle 1L. The source/author/license evidence is retained. Generic produce can attach automatically; branded packaging awaits merchant selection because no verified manufacturer catalogue is configured. Upload, default reset, disabled enrichment, failed lookup and late response behavior are verified independently.

Compiled QA uses a verified private fixture and normal login. It confirms production registration returns 503 when real email delivery is unconfigured; the development file outbox is never enabled for production. Real email, WhatsApp Business delivery and paid generative providers require configured services. Existing manual WhatsApp/share previews preserve explicit user confirmation.

Vercel staging cannot complete without `DUKAANSET_BACKEND_ORIGIN` pointing to a persistent HTTPS Node/SQLite backend. Durable media and closing jobs run on that backend. This release targets `dev`; production promotion remains a separate verified release. The feature PR must pass its exact-head Quality run before merge.

Private databases, uploads, outboxes, tokens and environment files are excluded from Git. A verified private backup preceded schema 8 migration. [Implementation/operating details](v13-1-product-transformation.md) describe the migration and rollback requirements.
