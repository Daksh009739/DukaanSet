# V16.1 implementation and visual review

The supplied composite is preserved in `approved-reference.jpeg`. Final implementation captures are `desktop.png` (1142 × 900), `mobile.png` (390 × 844) and `mobile-full.png`. These are a compiled application connected to a private, verified QA shop with saved invoices, payments and stock. They are not flattened mockups. The fictional QA figures come from its ledger; no sample figures appear in application rendering code.

| Reference feature | Implemented comparison |
| --- | --- |
| White desktop sidebar around 204px | 204px at the reference width; mint active row, approved new storefront identity, independent collapse toggle |
| Search topbar around 66px | 66px with global keyboard search, notifications, language and actual business/profile controls |
| Dark scenic hero around 310px | 310px at 1142px; original warm shop artwork on the right, greeting left, calendar/weather in the upper middle |
| Compact desktop voice pill at upper right | One 195px pill inside the hero; the shared assistant panel remains mounted; no second dashboard voice banner |
| Five desktop quick actions | Sale, product, customer, payment and purchase open the existing workflows, with role gating |
| Four ordered summaries | Session sales, all active bills, net cash collections and customer receivables from the current business |
| Chart/product row followed by bills/stock | Area chart and four actual top products; compact linked bills and low-stock tables below |
| Mobile composition | Dark logo header, scenic greeting/calendar/weather, full-width white voice pill, six actions, two-column summaries, chart and five navigation entries |

Assistant and Help remain in Business Tools on desktop and More on mobile, so the approved sidebar composition preserves access to existing modules.

Review sequence: inspect approved composite → capture first-pass desktop/mobile → fix the over-tall chart and axis contrast → fix a mobile width constraint and loading skeleton overflow → align product-row density and calendar/weather/pill columns → reduce mobile hero spacing so the chart fits above navigation → capture and inspect the compiled result. First-pass screenshots are retained as review evidence. Financial semantics and language copy were checked while refining the layout.

Verified locally:

- 259 unit tests passed, including all-ledger bill counts above the 1000-record visible limit, weather response validation/cache/coalescing, and authentication/business scope.
- Source lint, TypeScript, locale parity for 2358 keys in English/Hindi/Hinglish, and the labelled VoiceOS semantic evaluation passed.
- The optimized production build passed.
- All five V16.1 browser tests passed: existing action workflows, keyboard voice report without writes, real cash/count values, weather fallback and business switching, and ten widths in each language.
- The requested demo-strip removal was checked at 1142px and 390px: the hero begins at 66px and 76px respectively, account-menu demo controls remain visible, and no runtime errors or page overflow were observed.
- Existing browser suites passed: approved dashboard/media/shared modules (3), closing/versioned PDFs/concurrent accounting (3), contextual voice/scoped examples (7), and onboarding/auth/sales/purchases/refunds (7).
- After aligning dashboard selectors with the approved navigation, all nine mobile sales/recovery tests and the existing simulated voice-stock save/repeat check passed. The updated compiled closing review also passed its production smoke, dashboard accessibility, counted closing, three-language PDFs and durable scheduled-closing checks.
- The existing cross-module navigation, timeline and accessibility audit passed at eight screen widths and in English, Hindi and Hinglish using the restored desktop Business Tools links and mobile More menu.
- All six remaining compiled production reviews passed: V12 conversational billing/stock, V13 dashboard/media/invoices, V14 cross-module saves, V15 billing/intelligence, V15.2 contextual voice/detailed records, and V16.1 dashboard layouts. V15.2 language batches now use separate production rate-limit windows after the rapid audit was confirmed to receive HTTP 429; application limits remain 180 requests per user per minute.
- Compiled V16.1 review passed 30 layouts at 320, 360, 375, 390, 412, 430, 768, 1024, 1440 and 1920px in all three languages, with no document overflow, runtime errors or WCAG A/AA violations. See `production-report.json` for geometry and a local cached-navigation measurement; that measurement is not a production network performance guarantee.

The current display date/greeting uses the live browser clock in the saved shop timezone. The server supplies the accounting-session date separately. If the session spans an earlier date, its accounting date and session labels remain explicit. Financial reads never depend on weather.

Differences that follow real data and approved branding:

- The latest storefront logo replaces the older bag logo shown in the composite.
- Dates, greeting, bill numbers, totals, rankings and stock are actual saved shop data, rather than the reference's sample labels/figures.
- No provider key is configured, so captures show weather unavailable and the actual saved city. Ready-weather tests use explicitly mocked provider results. See `weather-setup.md`; live weather has not been claimed.
- Product photos reuse stored associations. The QA shop has no licensed photos, so its approved safe category icons appear. Uncertain product imagery is never silently selected.
- Fake growth percentages and decorative financial trend bars are omitted because those historical comparisons are not supplied by the authoritative data. The visible area chart and product share bars use real values.
- The scene is original illustration artwork following the approved direction, not an exact pixel copy. See `hero-art.md`.
- The owner requested removal of the demo strip. Demo disclosure, reset, closing-demo and registration controls now live in the account menu; the dashboard has no demo banner. Final captures use an isolated verified fixture.

Release scope is the feature branch → `dev` pull request. `main` follows normal review. Hosted staging remains dependent on the existing durable HTTPS backend configuration (`DUKAANSET_BACKEND_ORIGIN`); this review verifies local compiled production and does not claim a live staging deployment.
