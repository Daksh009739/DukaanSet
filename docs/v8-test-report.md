# DukaanSet V8 · premium website and brand experience

V8 redesigns the existing public website and authentication experience around connected shop records. It preserves the application routes, central language engine, session/authentication rules, invoice snapshots, customer data and financial transactions.

## Implemented experience

- Original geometric storefront/D/check identity, shared by runtime logos, navbar, auth and workspace. Editable light, dark, mono and invoice lockups, favicon, PWA icons, splash and social artwork are in `public/brand`. [Brand usage](../public/brand/USAGE.md) covers palette, typography, spacing, motion and print assets.
- A two-column product hero followed by the everyday problem, connected-sale workflow, VoiceOS, DemandPulse, Customer 360°, Invoice Studio, six business categories, language preview, setup journey, proposed plans, FAQ and final CTA.
- The fictional ₹1,798 sale uses two shirts at ₹899, stock 4 → 2, cash ₹1,000, UPI ₹500 and outstanding ₹298. Seven stages have play, pause, resume and replay controls. Reduced motion jumps to the finished example. Preview interactions make no writes and use no microphone.
- VoiceOS prepares a sample reviewed draft. DemandPulse distinguishes requests from a possible future sale. Invoice sharing distinguishes manual attachment from configured official delivery; previews contain no fabricated delivery status.
- Business Types switches six category-specific records, units and workflows, with arrow/Home/End keyboard controls. Features presents five outcomes with different product compositions. How It Works uses a seven-step journey and sticky desktop preview. Pricing compares proposed positioning categories without invented prices or paid checkout. Help has searchable FAQs and nine practical guides, with search first on mobile.
- A sticky responsive header, active navigation indicators, keyboard-controlled mobile drawer, language selection and premium footer. Existing detail, help, contact and legal routes remain available.
- Auth retains real endpoints and secure redirects. Forms add password visibility, length feedback, confirmation matching, legal acknowledgement, autofill, loading/error feedback and preserved values when changing language. Website, logo, legal and help links keep the selected language; the final browser recheck covers Hindi and Hinglish navigation. The real email verification/onboarding flow remains in place. Mobile forms precede decorative brand content.
- English, Hindi and Roman Hinglish cover all new copy. All **1,857 keys per locale** pass key/interpolation parity and visible-copy checks. Canonicals, hreflang, sitemap, localized metadata and private-route indexing protection are retained. Fonts are locally hosted.
- The public-only PWA cache advances to V8 so existing installations receive the new identity; merchant records and API responses never enter Cache Storage.

## Verification

| Check | Result |
| --- | --- |
| Locale parity and literal-copy checks | Passed; 3 languages, 1,857 keys each |
| Source lint and TypeScript | Passed |
| Existing unit regression | 143 passed |
| V8 behavioral browser suite | 4 passed |
| Public language/SEO and invoice/browser regressions | Passed |
| Full browser regression | 63 passed across 10 suites; see `qa/v8/e2e-report.json` |
| Production build | Passed; 86 generated page entries |
| Local production smoke | 7 baseline checks passed, plus 10 mobile public/auth renders, runtime and indexing checks |
| Visual/layout audit | 11 major public/auth screens at 320, 360, 375, 390, 412, 430, 768, 1024, 1440 and 1920px; no measured clipping/overflow or axe violations; additional Hindi/Hinglish mobile home checks |

Actual evidence is in [render results](qa/v8/render-report.json), [production results](qa/v8/production-report.json), and representative [desktop homepage](qa/v8/home-1440-viewport.png), [tablet homepage](qa/v8/home-768.png), [Hindi mobile homepage](qa/v8/production-home-hi-390.png), [mobile login](qa/v8/production-login-390.png) and [registration](qa/v8/production-register-390.png) screenshots. Major rendered pages were visually inspected. Contrast failures and a cramped 320px metric found in the first pass were corrected; entrance motion now preserves text opacity.

The brief referenced a screen recording, but none was present in this request's attachment directory. The running local website was captured before changes: [homepage](qa/v8/before-home.png), [business page](qa/v8/before-business.png) and [login](qa/v8/before-login.png).

Reproduce the visual audit against a running local server with `node scripts/qa/v8-website-review.mjs`. Set `QA_ORIGIN` for a different approved test origin. `npm run test:e2e -- tests/e2e/premium-website.spec.ts` checks multilingual pages, controls with no writes, navigation, search and auth feedback. GitHub Quality CI includes this suite alongside the existing auth, VoiceOS, localization and invoice suites.

The production JSON records a local cold-browser load with roughly **0.58s LCP**, **0.00068 CLS**, **280 KB JavaScript transfer** and no external asset requests. Earlier local loads measured 1.34s and 1.90s LCP. These are measurements on this Windows host, not hosted field results or Lighthouse scores. Local Windows validation encountered transient dependency and trace-artifact I/O errors, including one outside OneDrive. Trace artifacts were moved to temporary storage; final V8 and VoiceOS checks passed in a clean source-only temporary copy with locked dependencies. The final source also built successfully with local build-worker reads limited to one. Source/test hashes matched the verification copy. The original repository, merchant databases and credentials remained in place.

## Release and external limits

The implementation uses a feature branch and pull request to `dev`. Production `main` remains unchanged; this is not a production promotion.

Hosted Vercel staging still requires the isolated persistent Node 24 backend, readiness token and verified email configuration described in [staging setup](VERCEL_STAGING_SETUP.md). The Vercel project/settings page and protected branch alias are not proof of a working application deployment. No verified live V8 staging URL is claimed. Official WhatsApp delivery also requires the authorised sender and approved templates described in [delivery setup](WHATSAPP-DELIVERY.md). No real message was sent by this work.

PDF documents retain the merchant's saved identity and issued snapshots. The new platform print assets do not replace old merchant logos or rewrite invoices. No live bank verification, paid subscription checkout or new financial automation is introduced by the public previews.
