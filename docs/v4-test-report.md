# V4 VoiceOS implementation and verification

Date: 9 October 2026. Environment: Windows, Node 24, Next 16.4, headless Edge browser QA. Tests use in-memory or isolated `.data/e2e.sqlite` fictional databases on port 3001. The merchant's port-3000 database was not reset. Its health endpoint remained `{ "ok": true }`.

## Verified checks

- `npm test`: **116 passed, 0 failed**, including 16 VoiceOS tests. Covers Hindi/English/Hinglish numbers, aliases across four business categories, safe variants, missing-information follow-ups, active corrections, manual edits, numeric sizes, price basis, fractional repeats, exact split payments, one-time stock deductions/receipts, contact duplicate/retry isolation, full-ledger reports past the UI history cap, feature/role/tenant boundaries and old-dues collection.
- `npm run typecheck`: **passed** on the final source.
- `npm run build`: **passed** on the final source; all 30 static pages generated and dynamic app/API routes compiled.
- `npm run test:e2e`: **43 passed, 0 failed**, completed 9 October 2026 at 15:16 UTC. Each suite ran against a fresh isolated server: product 7, V2 business 2, V2 sales 9, V2 voice 6, V3 demand 8, voice products 3, VoiceOS 8. All seven suite processes exited 0.

The final VoiceOS browser checks verified the global A/D/E bill/payment/report flow, B/C stock and demand updates, manual/voice corrections, cancellation, contacts/purchases/expenses/closing, navigation/reorder/message previews, one mocked microphone owner across business changes, 320/360/375/390/768/1440px overflow checks, independent display/spoken languages and zero Axe WCAG A/AA violations in the new VoiceOS panel. These are application/browser event checks, not physical microphone accuracy measurements.

## Issues found and corrected during implementation

| Initial failure | Correction / regression coverage |
| --- | --- |
| Global draft disappeared on a private route change. | The shared providers now live in the persistent private layout; forms consume the scoped handoff once after hydration. |
| A missing payment description could inherit a fully paid cash default. | Voice-assisted bills require explicit payment review; the missing-payment flag survives draft reload. |
| Manual quantity/price edits could be replaced by an older voice context. | The real form is authoritative before a correction is interpreted. |
| `12,500` was mistaken for two clauses; `kilo` could be read as a price prefix. | Validate grouped amounts before clause handling and enforce whole-word price markers. |
| “Available nahi hain” was treated as an item correction. | New demand and availability descriptions retain their actual requested units. |
| Shared stock preprocessing lost comma/correction delimiters. | The stock adapter preserves punctuation while converting spoken numbers; its five-item sample and corrected quantities have a dedicated regression. |
| Privacy text failed contrast at 4.03:1. | Darkened its foreground; the VoiceOS Axe check passed. |
| A newly seeded historical credit sale appeared before opening stock. | Demo opening movements precede that historical invoice; full ledger/stock reconciliation passes. |
| Older demo assertions assumed no historical Fashion invoice. | Assertions now include the real ₹1,299 historical invoice and distinguish new-bill credit from total account outstanding. |
| Running several suites against one process exhausted the demo-creation throttle. | Use the existing default runner's fresh server per suite. CI also runs baseline and VoiceOS suites separately. Production throttles remain enabled. |

## Acceptance scope and limits

The feature is integrated with real local business transactions and the existing permissions, audit and recovery paths. Recognition still depends on the browser's real speech service. Automated speech tests inject labelled events to verify adapter behaviour; typed commands drive the same editable forms and actual backend mutations. Neither proves recognition of a physical recording.

Physical Android/desktop recordings, noisy-shop accent accuracy, live HTTPS microphone permissions and live Vercel staging A–E remain **unverified**. The current voice interpreter is deterministic; no model-backed free-form provider, offline STT, regional language pack or TTS service is configured. UPI entries are manual records. Reorder planning and message preview do not claim receipt or delivery.

The Vercel gateway still needs a persistent isolated backend URL/volume, check token and verified mail sender. This V4 release does not merge into main, expose production data, weaken deployment protection or turn a failed preview into a live demo. See [staging report](staging-test-report.md).

Screenshots from fictional browser QA: [English phone](qa/v4/voice-billing-phone-en.png), [Hindi phone](qa/v4/voice-billing-phone-hi.png), [desktop](qa/v4/voice-billing-desktop-en.png). See [setup and demo guide](v4-voiceos.md).
