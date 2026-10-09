# DukaanSet V2 voice stock entry

9 October 2026. The implementation connects browser speech transcription, deterministic multilingual parsing, editable review and the existing transactional inventory backend. It is **rules-assisted**, not a live AI service. Automated parsing/API/browser checks passed as described below; physical microphone recognition and accuracy in real shops remain field validation work.

## Merchant workflow

Open Stock → **Add stock by voice / Bolkar Stock Jodo** → choose the spoken-language override → deliberately start the microphone → stop whenever needed → edit the transcript → review the extracted rows → resolve missing/ambiguous details → confirm stock. Speaking or reviewing never saves stock by itself.

The voice page is `/app/stock/voice`; recent batch entries are at `/app/stock/voice-history`. Both run inside the authenticated business workspace. Application display language controls English/Hindi/Hinglish labels and unit descriptions. The spoken-language selector independently requests `en-IN` or `hi-IN`; there is no invented dedicated Hinglish locale. Mixed-language recognition quality depends on the browser's speech service.

Typing, pasting a command and manual rows work without microphone recognition. A clearly labelled sample-command simulator is available only in an isolated demo account; it inserts text and does not pretend to capture live speech. Real accounts start with their own catalog, not demo products.

Review rows expose product, quantity, spoken unit, current stock, proposed canonical addition and warnings. Users can change products/units/quantities, remove rows, add manual items or record a correction. Confirmation is disabled for unresolved rows unless the user explicitly selects **Save only resolved rows**. Skipped rows remain an unsaved draft after success. The saved summary reports actual returned products, lines and quantities, with a history link.

## Parsing and matching

The parser uses the selected business's catalog and aliases. Exact names/aliases, shared Hindi/English/Hinglish synonyms and unique token matches can resolve a product. Multiple plausible products remain unresolved: saying “2 kilo dal” with more than one matching dal asks for the exact product. Fuzzy/edit-distance and simple phonetic suggestions require manual selection even when only one candidate is suggested. Recent batch frequency changes suggestion ordering, never ambiguity rules.

Brand and saved variation tokens participate in matching. Product aliases remain tenant-scoped catalog data; shared aliases may legitimately point to more than one product, requiring clarification. Unknown products are not silently created. The review links to Stock for guided product creation; price, cost, expiry, tax and supplier fields are not invented.

Examples exercised by automated tests:

- The supplied five-product command: “Bhai, 4 doodh ke packet add kar do, 2 kilo dal, 5 kilo pyaz, 10 kilo aloo aur 3 packet biscuit bhi add kar do.”
- “Add four milk packets”, “चार दूध के पैकेट जोड़ दो” and “Char doodh ke packet add kar do”.
- Half/aadha, dedh, dhai/ढाई, Hindi digits, common English/Hindi number words and exact decimal quantities.
- “10 kilo aloo … nahi, 5 kilo aloo”, “4 milk packets … sorry, 6 packets”, “Pyaz hata do” and “Dal ki quantity 2 se 3 kilo kar do”.
- An incomplete “aloo add kar do”, followed by “10 kilo”, fills one unambiguous incomplete row without restarting the other rows.

Corrections replace a clear matching row; unclear corrections remain unresolved. A quantity-only reply cannot silently choose among several incomplete rows. Explicit repeated product mentions remain separate review rows and are aggregated by the server into one stock movement per product. Recognition result indices are replaced as interim/final text changes, so repeated speech events do not append the same item again. Reviewing the identical already-applied transcript is also guarded.

This is a bounded grammar and vocabulary, not general natural-language understanding. It does not cover every Hindi numeral spelling, accent, product synonym, sentence shape or noise condition. No confidence/accuracy percentage is claimed. Complex size/model naming, several simultaneous corrections, unsupported conversions and unclear clauses must be reviewed manually. Aliases and precise units improve reliability, but every entry still needs confirmation.

## Quantity and unit rules

Quantities become integer thousandths of the product's canonical stock unit. Conversion uses integer arithmetic and rejects values that cannot be represented exactly. Zero, negative, over-limit and invalid-precision quantities cannot be saved.

| Spoken quantity/unit | Canonical example | Constraint |
| --- | --- | --- |
| `500 grams` | `500` thousandths for a kg product = 0.500kg | Weight-compatible product only |
| `half/aadha kilo` | `500` for kg | No rounding across incompatible units |
| `dedh kilo`, `dhai kilo` | `1500`, `2500` for kg | Same precise rules as typed decimals |
| `500 ml` | `500` for a litre product = 0.500L | Volume-compatible product only |
| `ek dozen` | `12000` for a piece product = 12 pieces | Does not imply dozen-to-kg or other guessed conversion |
| `4 packets` | `4000` for a packet product | Whole packet stock required |
| `2 boxes` with pack size 12 | `24000` base units | Requires the product's explicit saved pack-size configuration |
| `metres / meters / metre / m` | Product length unit | No invented length/weight equivalence |

Piece, packet, box, pair and bottle stock must remain whole units. Packet/pack and box conversion to another base unit uses the saved pack size; it is refused when configuration is absent. The product's canonical unit remains visible in the review. A missing spoken unit is highlighted for the merchant to complete. This feature does not introduce batch expiry, vegetable daily-rate history, clothing variant stock or mobile warranty/serial tracking; those remain separate category requirements.

## Persistence, retries and history

Confirmation calls `POST /api/businesses/:id/stockbatch` with:

```json
{
  "idempotencyKey": "one-stable-key-per-reviewed-attempt",
  "source": "voice",
  "items": [{ "productId": "authorized-product-id", "quantityMilli": 500 }]
}
```

The UI sends canonical product quantities and a source of `voice`, `manual` or `mixed`; it does not send transcript or raw audio. The server validates authenticated membership, related tenant/product IDs, bounds and units, aggregates duplicate product IDs, and writes balances, movements, entry history and audit together in one transaction. A repeat of the same key/payload returns the original entry; a changed payload with the same key is rejected. Invalid batches do not partially update stock.

If a save acknowledgement is lost, the submitted payload/key remains frozen and editable controls stay locked. Retrying that entry sends the same payload instead of preparing another stock addition. The UI asks the merchant to inspect stock/history before changing an uncertain attempt. A successful save refreshes the shared stock/dashboard state and reports the actual returned entry.

History stores timestamp, source, snapshotted product/unit/quantity and linked movement IDs. It does not store the command or audio. **Prepare repeat** creates a new draft/key; it never updates stock automatically. Inspect the new draft before confirming, especially after catalog changes. Preparing a repeat intentionally replaces the current voice draft; preserve or complete existing unsaved work first.

## Speech support and privacy

The feature uses `SpeechRecognition` or its browser-prefixed equivalent. It requests continuous/interim results and exposes Start/Stop, permission, unsupported-browser, no-microphone, network, no-speech, unsupported-language and interruption feedback. It does not automatically restart recording. Navigation/business changes abort the active recognizer. Microphone start requires a deliberate user click; the application permissions policy permits the same-origin microphone.

Web Speech recognition has limited browser availability. Some implementations send audio to a browser/vendor service and require connectivity; requesting a locale does not prove that locale is available on a particular device. The page explains vendor processing before microphone activation and offers typing throughout. No browser audio recorder, raw-audio upload or raw-audio retention is implemented by DukaanSet. No speech/AI provider key is exposed in client code. [MDN SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition), [MDN Web Speech usage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API).

Unsent text/rows and a retry snapshot use browser **sessionStorage**, keyed by user and business. This supports refresh/offline recovery in the same tab/session. Recovery accepts drafts younger than 24 hours; visiting the page after expiry starts and stores a fresh draft. There is no background cleanup timer. Normal tab/session closure follows browser sessionStorage behavior; application logout clears voice drafts. Unresolved sales/customer requests use a separate account-scoped recovery policy. Storage denial/quota failure shows an explicit warning. This is not encrypted multi-device draft storage, a server draft or offline stock synchronization. No stock is labelled saved while only a draft exists. Inspect stock/history after an uncertain save before creating another entry, including after a tab is closed or a draft expires.

Demo reset rebuilds sample records only in the authenticated user's isolated demo businesses, keeping demo business IDs/language and leaving real accounts untouched. It uses the shared reset flow to refresh the returned business roster, clear that user's scoped sale/voice drafts and remount the workspace content. Recording/manual controls are locked during the reset.

## Automated evidence

Verified with Node.js 24 and Playwright/Microsoft Edge in the local workspace:

| Check | Command | Result |
| --- | --- | --- |
| Voice parser/speech/API | `node --import tsx --test tests/voice.test.ts` | **17 passed** |
| TypeScript | `node scripts/run.mjs typecheck` | Passed during voice integration |
| Voice browser suite | `node node_modules/@playwright/test/cli.js test tests/e2e/v2-voice.spec.ts` | **6 passed**, 1.2 minutes, final changed-source rerun |
| Scoped accessibility | Included in the first voice browser case using axe WCAG 2 A/AA rules | **0 violations** in the English phone voice-review screen; not a complete application or WCAG certification |

The 17 focused tests cover the supplied utterance, English/Hindi/Hinglish aliases, clause splitting, repeated product mentions, numbers/precision, corrections/removal, missing replies, ambiguous/fuzzy/unknown matches, bounded long-input matching, unit/pack constraints, variant tokens, tenant-scoped drafts, indexed interim/final events, speech errors and actual atomic stockbatch replay/rollback/history references.

The six browser tests cover simulator/review/ambiguity/confirmation, history repeat without auto-save, three display languages at 320/390/768/1440 widths, correction/follow-up/manual hybrid, refresh recovery/offline blocking, unsupported and permission-denied speech, duplicate API retry/foreign IDs/demo reset, a lost save acknowledgement and mocked recognizer Start/Stop/repeated final events. Mocked speech validates the adapter and UI; it is not evidence of physical microphone or vendor transcription accuracy. The mobile recording control remains visible above the bottom navigation while listening, including when the transcript/review is below the fold.

Fictional demo screenshots are saved by the voice browser suite directly into `docs/qa/v2`, so another suite's `test-results` cleanup does not remove them: [English phone](qa/v2/voice-phone-en.png), [English review](qa/v2/voice-phone-en-review.png), [Hindi phone](qa/v2/voice-phone-hi.png), [Hindi review](qa/v2/voice-phone-hi-review.png), [Hindi desktop](qa/v2/voice-desktop-hi.png), and [mocked listening controls](qa/v2/voice-listening-ui-mock-en.png). The last image uses a deterministic speech adapter, not a physical microphone. Native product names stay as recorded when display language changes. The saved phone (390×844) and desktop (1440×1000) captures were visually inspected: review controls and Hindi text remain readable, the two-column desktop layout becomes a single phone column, and the mobile Stop dock stays above navigation. Low-contrast stock/helper/reset captions found by axe were darkened before the final passing run. These are local development UI evidence, not production or real-device acceptance.

## Real-device field test checklist

Use fictional products in an isolated demo. This checklist records the remaining speech/device validation; it does not block ordinary source review or imply a new deployment approval.

1. Record device/OS/browser/version, secure URL, selected spoken locale, network state and microphone. Test the actual supported device rather than relying on API presence.
2. Allow microphone access deliberately; verify recording indication and immediate Stop. Deny access in a fresh session and check the typing fallback. Navigate or switch business during listening and verify recording ends.
3. Speak the supplied five-item command in English, Hindi and mixed speech. Compare the transcript and preview quantities/products against the intended utterance before confirming. Log recognition mistakes separately from parser mistakes.
4. Test quiet room and representative shop noise, different speakers/accents, pauses, fast speech and long product/brand/variant names. Avoid customer/private information in transcripts.
5. Say half/aadha, dedh, dhai, 500g, whole packets, one dozen and a configured box size. Verify incompatible/unknown conversions are refused and no quantity is rounded silently.
6. Try a shared “dal” alias, an unknown product, omitted quantity/unit and ambiguous correction. Resolve the review manually; verify no automatic selection or catalog creation.
7. Correct quantities, remove an item, speak a follow-up and add a manual item. Check all rows remain editable and confirmation is disabled until resolved or explicitly excluded.
8. Disconnect during listening/review/save, interrupt recording, refresh the tab and retry an uncertain save. Verify an unsaved draft remains clearly unsaved and a stable retry does not add stock twice.
9. Confirm once, inspect stock and movement/history references, prepare a repeat and verify it remains a draft until confirmed. Reset the demo and check real accounts remain unaffected.
10. Review phone keyboard/focus/zoom/long Hindi text and screen-reader status/error announcements. Record actual device outcomes and unresolved issues before claiming speech or production acceptance.

Further provider integration, on-device recognition guarantees, voice feedback/TTS, wider grammar and real shop accuracy measurement remain future work. The feature does not certify production readiness of the larger application.
