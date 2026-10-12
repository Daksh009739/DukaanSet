# VoiceOS 3.3 real speech acceptance

Status: pending. Automated speech callbacks and synthetic audio do not satisfy this check.

Use the reviewed build on an HTTPS staging site with a fictional shop. Desktop localhost is a secure context; an Android phone cannot use the desktop's `127.0.0.1`, and plain HTTP on a LAN address does not provide the required microphone context. Record the tested commit, browser version, device, date and selected genuine voice. Keep credentials in server configuration.

Choose a genuine available voice in Voice Settings. If cloud audio is used, enable its disclosed audio consent. Verify the configured STT and TTS with actual speech and playback; record which providers were used. Native browser recognition and native device TTS are separate capabilities from cloud providers.

## Main conversation

1. Create one existing Rahul in the test shop. Note his record ID and phone. Select English in the topbar.
2. Open VoiceOS once. Hear the greeting and allow browser microphone permission. The microphone should start after the greeting without another click.
3. Say “Rahul naam ka customer add kar do.” Finish speaking normally. Do not press Stop or Send. Expect the existing-or-separate question and automatic listening again.
4. Say “Koi nahi, same naam se naya bana do.” Expect a separate Rahul draft and “Save kar doon?” The old sales report must not appear.
5. Say “Haan, save kar do.” Verify a second, distinct Rahul ID in Customers, with the original Rahul unchanged. Success must be spoken only after the new record is verified. Continue with another task without a microphone click.
6. Repeat the choice with “Koi nahi, phir se add kar do” and “Nahi, dusra Rahul hai.” Cancel unsaved drafts between repetitions. A bare “yes” at the duplicate question must not choose a separate customer.
7. Try the original Rahul's phone on a separate draft. Expect a conflict, with no saved duplicate identifier. Correct the name with “Rahul nahi Rohan.” The separate-name decision must not silently apply to a new name.

## Business and audio checks

| Check | Speech/action | Expected result |
| --- | --- | --- |
| Billing | Select an unambiguous test customer; say “10 kilo daal, 80 rupaye kilo”, then “500 UPI 300 udhaar”, then confirm | One ₹800 invoice, ₹500 UPI receipt, ₹300 receivable and 10 kg deduction; no write before confirmation |
| Payment | Collect a known customer's ₹100 cash, then confirm | One receipt and the correct outstanding balance |
| Stock | Add 10 kg to a known product, review and confirm | One stock movement; invoices and customer balances unchanged |
| Corrections | “10 kilo nahi 12 kilo”; “Cash nahi UPI”; “Last product hata do” | The current draft changes; it does not become a different task |
| Language | Open in each topbar language, speak clear English/Hindi/Hinglish, then “haan” or “500 cash” | App-language greeting, clear-language adaptation, stable short-answer language, unchanged topbar preference |
| Voice | Preview and select an actual voice; reload and use Main Settings | Real playback and the same persisted voice; no invented voice options |
| Pauses | Short “Haan”, “Nahi”, “Cash”, “500 rupaye”; a long bill with natural pauses | Exactly one final dispatch per complete utterance, no missing product or cut-off prefix |
| Noise | Repeat with ordinary shop background noise | No assistant audio captured as user speech; no accidental action from noise |
| Pause/close | Pause during greeting/listening; wait; resume; close during listening/playback | Pause stays latched, explicit Resume works, close stops capture/playback and ignores late callbacks |
| Permissions | Deny microphone access, then type | Clear recovery and usable typing; no pretend listening |
| Network | Interrupt connection during a confirmed test save, restore and retry | Exact request status is checked; a committed save is recovered without a second write |
| Shop switch | Switch shops with an unfinished draft, then reopen | No audio or customer/product/financial context leaks between shops |

Supplier, purchase, document, demand and closing commands continue into their existing reviewed forms. Verify those real services separately; this build does not claim spoken completion for every form.

## Evidence and gate

Run the main scenarios on desktop and on a physical Android phone. Use at least 20 measured utterances per device, including short answers and longer bills. Record success counts, duplicate-follow-up attempts, failures, duplicate backend writes and the time from final user speech to the start of the spoken reply. Calculate p95 from the actual recorded timings. Do not count a typed instruction as a successful microphone turn.

Save dated notes or a recording link with fictional test records in `live-acceptance.json`. Each required scenario needs a passed result for each device. Keep untested fields pending. The acceptance thresholds are at least 95% endpoint, intent and duplicate-follow-up success, zero duplicate backend writes, spoken reply p95 within 8 seconds, and no unresolved critical failure.

Run `node scripts/qa/voice33-release-gate.mjs` after recording the evidence. Main promotion is gated on this record and CI/review; a passing synthetic test suite alone is insufficient.
