# V11.1 / V12 verification and integration policy

Date: 10 October 2026. Feature branch: `feature/voiceos-smart-stock`, based on `dev`. The preserved user briefs are [V11.1](briefs/v11-1-global-voiceos-master.md) and [V12](briefs/v12-smart-voice-stock-master.md).

## Verified locally

| Check | Result |
|---|---|
| Node.js 24 unit/service tests | 179 passed, including 19 conversational/stock tests |
| TypeScript and generated route types | Passed |
| Source lint | Passed across 130 source files |
| English / Hindi / Hinglish locale coverage | 2,060 keys per language; complete key/variable parity; no hardcoded visible source text |
| Locked dependency installation in a clean temporary checkout | Passed; zero reported vulnerabilities |
| Clean production build | Passed; separate dependencies/build directory from the running user app |
| Compiled V11.1/V12 browser QA | Five groups passed: atomic customer/bill, automatic missing-product stock, global existing-stock increments/explicit rates, mobile accessibility, no runtime errors |
| Compiled existing dashboard/closing QA | Six groups passed, including seven public/security/PWA smoke checks, translated PDF responses and real backend automatic closing with the fictional browser page closed |

The compiled checks use an isolated fictional database. They assert actual persisted products, stock quantities, inventory snapshots, invoices and received cash. A prepared purchase cost does not generate an unrelated supplier invoice or payment. Mobile screenshots from the compiled app were inspected. Automated axe results are a useful check, not a claim of complete accessibility certification.

## Browser regression and CI

The regression set contains 71 tests across 12 suites: closing dashboard, conversational VoiceOS, Invoice Studio, localisation, premium website, core product/security flows, business details, sales recovery, focused voice stock, DemandPulse, automatic product stock and existing VoiceOS integrations. Each suite starts a fresh server so test authentication does not exhaust a production throttle. Production rate limits remain enabled.

Existing financial assertions are retained when updating selectors for the compact input, expandable product editors and **Save All Stock** label. The new conversation suite checks one final confirmation, double clicks, lost-response recovery after reload, missing-rate clarification, exact stock/batch costs and 320/390/768/1440-pixel layouts. Recognition doubles verify the real browser adapter's callbacks and cleanup without claiming physical speech accuracy.

The Quality workflow runs locked installation, localisation, lint, generated route types, all unit tests, production build, critical browser suites, and both compiled QA scripts. Integration is gated on the successful **pull-request Quality run for the exact feature head**. The attached GitHub PR is the authoritative release-check record; no production promotion follows automatically from a dev merge.

## Corrections verified during implementation

- Customer names containing “ke naam se” retain the name instead of the word “se”.
- A comma after “nahi” retains the stock correction instead of appending duplicate stock.
- “Selling price” within an explicit stock-add instruction stays a stock operation; the substring “sell” cannot redirect it into a bill.
- Per-unit selling rates and purchase costs carry independent spoken units. A batch cost already converted to the catalogue unit is not converted twice.
- Quantity corrections retain selling rates and require inconsistent selling totals to be clarified. Explicit batch purchase totals derive exact new unit costs.
- Canonical aliases within a receipt create one product; compatible quantities and purchase-total snapshots aggregate together.
- Draft hydration and asynchronous results remain scoped to the selected business.

## Operational limits and release boundary

The current catalogue genuinely requires a new product's selling rate. The assistant asks for that field inline; a blank optional purchase cost follows the existing catalogue default and is not described as a known cost. Dependent customer-plus-sale and stock batches are transactional; specialised purchases, supplier payments, demand, documents and closing retain their existing reviewed forms where needed.

There is no configured generative speech/LLM service, official WhatsApp sender or verified physical-microphone run in this environment. Typed commands, deterministic interpretation and browser speech fallback are implemented. Real provider delivery and device transcription remain external checks.

Vercel's gateway deployment requires a configured HTTPS `DUKAANSET_BACKEND_ORIGIN` and a persistent Node.js 24 backend with private durable storage. The earlier dev deployment failed that environment prerequisite. This source release does not claim live staging acceptance. Main, staging and production branch promotion are outside this dev integration; the existing production-domain setting remains unchanged.
